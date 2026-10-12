import { Types } from 'mongoose';
import { Campaign, type ICampaign, type Platform } from '../models/Campaign';
import { Submission } from '../models/Submission';
import type { IUser } from '../models/User';
import { AppError } from '../utils/AppError';
import type { CreateCampaignInput } from '../validation/campaign.schemas';
import type { Milestone } from './payout';
import { toSubmissionDTO, type SubmissionDTO } from './submissionService';

export interface CampaignDTO {
  id: string;
  name: string;
  platform: Platform;
  totalBudget: number;
  spentBudget: number;
  remainingBudget: number;
  milestones: Milestone[];
  /** A campaign is live (accepting posts) while it still has budget left. */
  isLive: boolean;
  brandName?: string;
  submissionCount?: number;
  createdAt: string;
}

type CampaignDoc = ICampaign & { _id: Types.ObjectId };
/** The fields a DTO is built from; `brand` is excluded so populated and unpopulated docs both fit. */
export type CampaignFields = Omit<CampaignDoc, 'brand'>;

export function toCampaignDTO(
  campaign: CampaignFields,
  extras: { brandName?: string; submissionCount?: number } = {},
): CampaignDTO {
  const remainingBudget = campaign.totalBudget - campaign.spentBudget;
  return {
    id: campaign._id.toString(),
    name: campaign.name,
    platform: campaign.platform,
    totalBudget: campaign.totalBudget,
    spentBudget: campaign.spentBudget,
    remainingBudget,
    milestones: campaign.milestones.map(({ viewThreshold, payout }) => ({ viewThreshold, payout })),
    isLive: remainingBudget > 0,
    createdAt: campaign.createdAt.toISOString(),
    ...extras,
  };
}

export async function createCampaign(brandId: string, input: CreateCampaignInput): Promise<CampaignDTO> {
  const campaign = await Campaign.create({ ...input, brand: brandId, spentBudget: 0 });
  return toCampaignDTO(campaign.toObject(), { submissionCount: 0 });
}

/** A brand's own campaigns, newest first, with budget spent vs remaining and submission counts. */
export async function listBrandCampaigns(brandId: string): Promise<CampaignDTO[]> {
  const campaigns = await Campaign.find({ brand: brandId }).sort({ createdAt: -1 }).lean<CampaignDoc[]>();

  const counts = await Submission.aggregate<{ _id: Types.ObjectId; count: number }>([
    { $match: { campaign: { $in: campaigns.map((c) => c._id) } } },
    { $group: { _id: '$campaign', count: { $sum: 1 } } },
  ]);
  const countByCampaign = new Map(counts.map((c) => [c._id.toString(), c.count]));

  return campaigns.map((campaign) =>
    toCampaignDTO(campaign, { submissionCount: countByCampaign.get(campaign._id.toString()) ?? 0 }),
  );
}

/** Campaigns creators can still submit to: those with budget remaining. */
export async function listLiveCampaigns(platform?: Platform): Promise<CampaignDTO[]> {
  const campaigns = await Campaign.find({
    $expr: { $lt: ['$spentBudget', '$totalBudget'] },
    ...(platform ? { platform } : {}),
  })
    .sort({ createdAt: -1 })
    .populate<{ brand: Pick<IUser, 'name'> | null }>('brand', 'name')
    .lean();

  return campaigns.map((campaign) =>
    toCampaignDTO(campaign, { brandName: campaign.brand?.name ?? 'Unknown brand' }),
  );
}

/** Submissions on one of the brand's campaigns. Brands can only see their own campaigns. */
export async function listCampaignSubmissions(brandId: string, campaignId: string): Promise<SubmissionDTO[]> {
  const campaign = await Campaign.findById(campaignId).lean<CampaignDoc>();
  if (!campaign || campaign.brand.toString() !== brandId) {
    throw AppError.notFound('This campaign does not exist or does not belong to you.');
  }

  const submissions = await Submission.find({ campaign: campaign._id })
    .sort({ createdAt: -1 })
    .populate<{ creator: Pick<IUser, 'name'> | null }>('creator', 'name')
    .lean();

  return submissions.map((submission) =>
    toSubmissionDTO(submission, campaign, { creatorName: submission.creator?.name ?? 'Unknown creator' }),
  );
}
