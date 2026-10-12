import mongoose, { Types } from 'mongoose';
import { Campaign, type ICampaign, type Platform } from '../models/Campaign';
import { Submission, type ISubmission } from '../models/Submission';
import { AppError } from '../utils/AppError';
import { normalizePostUrl } from '../utils/postUrl';
import { formatNumber } from '../validation/common';
import { MAX_VIEWS, type CreateSubmissionInput } from '../validation/submission.schemas';
import { calculatePayout, findNextMilestone, type Milestone } from './payout';

export interface SubmissionDTO {
  id: string;
  campaignId: string;
  campaignName: string;
  platform: Platform;
  postUrl: string;
  views: number;
  reachedMilestone: number | null;
  /** Lowest milestone not yet reached, so the UI can show "next target". */
  nextMilestone: Milestone | null;
  entitledAmount: number;
  paidAmount: number;
  /** entitledAmount - paidAmount: earned but unpaid because the campaign budget ran out. */
  unpaidDueToBudget: number;
  creatorName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ViewUpdateResult {
  submission: SubmissionDTO;
  /** Amount paid by this particular update (0 if no new milestone or no budget left). */
  paidNow: number;
  cappedByBudget: boolean;
  campaign: { id: string; spentBudget: number; remainingBudget: number };
}

export interface EarningsSummary {
  totalEarnings: number;
  totalEntitled: number;
  unpaidDueToBudget: number;
  submissionCount: number;
  submissions: SubmissionDTO[];
}

type SubmissionFields = Omit<ISubmission, 'creator' | 'campaign'> & { _id: Types.ObjectId };
type CampaignSummary = Pick<ICampaign, 'name' | 'platform' | 'milestones'> & { _id: Types.ObjectId };

export function toSubmissionDTO(
  submission: SubmissionFields,
  campaign: CampaignSummary,
  extras: { creatorName?: string } = {},
): SubmissionDTO {
  return {
    id: submission._id.toString(),
    campaignId: campaign._id.toString(),
    campaignName: campaign.name,
    platform: campaign.platform,
    postUrl: submission.postUrl,
    views: submission.views,
    reachedMilestone: submission.reachedMilestone,
    nextMilestone: findNextMilestone(submission.views, campaign.milestones),
    entitledAmount: submission.entitledAmount,
    paidAmount: submission.paidAmount,
    unpaidDueToBudget: submission.entitledAmount - submission.paidAmount,
    createdAt: submission.createdAt.toISOString(),
    updatedAt: submission.updatedAt.toISOString(),
    ...extras,
  };
}

export async function createSubmission(creatorId: string, input: CreateSubmissionInput): Promise<SubmissionDTO> {
  const campaign = await Campaign.findById(input.campaignId);
  if (!campaign) {
    throw AppError.notFound('This campaign no longer exists.');
  }
  if (campaign.spentBudget >= campaign.totalBudget) {
    throw AppError.conflict('This campaign has used its full budget and is no longer accepting posts.');
  }

  const postUrl = normalizePostUrl(input.postUrl, campaign.platform);
  if (await Submission.exists({ postUrl })) {
    throw AppError.conflict('This post has already been submitted to a campaign.');
  }

  const submission = await Submission.create({ campaign: campaign._id, creator: creatorId, postUrl });
  return toSubmissionDTO(submission.toObject(), campaign);
}

/**
 * Applies a new view count to a submission and pays any newly earned milestone, capped at the
 * campaign's remaining budget.
 *
 * Runs in a MongoDB transaction: the submission and the campaign's spentBudget are updated together
 * or not at all. If two updates race on the same campaign, MongoDB raises a write conflict for one of
 * them and `connection.transaction` retries it against fresh data, so the budget can never be overspent.
 */
export async function updateSubmissionViews(submissionId: string, views: number): Promise<ViewUpdateResult> {
  if (!Types.ObjectId.isValid(submissionId)) {
    throw AppError.notFound('This submission does not exist.');
  }

  return mongoose.connection.transaction(async (session) => {
    const submission = await Submission.findById(submissionId).session(session);
    if (!submission) {
      throw AppError.notFound('This submission does not exist.');
    }
    if (views < submission.views) {
      throw AppError.badRequest(
        `View count must be between ${formatNumber(submission.views)} and ${formatNumber(MAX_VIEWS)}, because a post's views can't go down.`,
      );
    }

    const campaign = await Campaign.findById(submission.campaign).session(session);
    if (!campaign) {
      throw AppError.notFound('The campaign for this submission no longer exists.');
    }

    const result = calculatePayout({
      views,
      milestones: campaign.milestones,
      alreadyPaid: submission.paidAmount,
      remainingBudget: campaign.totalBudget - campaign.spentBudget,
    });

    if (result.payoutNow > 0) {
      // The filter re-checks the cap inside the write itself, as a last line of defence.
      const { modifiedCount } = await Campaign.updateOne(
        { _id: campaign._id, spentBudget: { $lte: campaign.totalBudget - result.payoutNow } },
        { $inc: { spentBudget: result.payoutNow } },
        { session },
      );
      if (modifiedCount !== 1) {
        throw AppError.conflict('The campaign budget changed while this update was running. Please try again.');
      }
      campaign.spentBudget += result.payoutNow;
    }

    submission.views = views;
    submission.reachedMilestone = result.milestone?.viewThreshold ?? null;
    submission.entitledAmount = result.entitledAmount;
    submission.paidAmount = result.newPaidAmount;
    await submission.save({ session });

    return {
      submission: toSubmissionDTO(submission.toObject(), campaign),
      paidNow: result.payoutNow,
      cappedByBudget: result.cappedByBudget,
      campaign: {
        id: campaign.id,
        spentBudget: campaign.spentBudget,
        remainingBudget: campaign.totalBudget - campaign.spentBudget,
      },
    };
  });
}

export async function getCreatorEarnings(creatorId: string): Promise<EarningsSummary> {
  const submissions = await Submission.find({ creator: creatorId })
    .sort({ createdAt: -1 })
    .populate<{ campaign: CampaignSummary | null }>('campaign', 'name platform milestones')
    .lean();

  const dtos = submissions
    .filter((s): s is typeof s & { campaign: CampaignSummary } => s.campaign !== null)
    .map((s) => toSubmissionDTO(s, s.campaign));

  const totalEarnings = dtos.reduce((sum, s) => sum + s.paidAmount, 0);
  const totalEntitled = dtos.reduce((sum, s) => sum + s.entitledAmount, 0);

  return {
    totalEarnings,
    totalEntitled,
    unpaidDueToBudget: totalEntitled - totalEarnings,
    submissionCount: dtos.length,
    submissions: dtos,
  };
}
