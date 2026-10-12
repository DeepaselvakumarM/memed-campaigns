import { z } from 'zod';
import { PLATFORMS } from '../models/Campaign';
import { formatNumber, pickedOption, requiredText, wholeNumber } from './common';

export const LIMITS = {
  maxBudget: 100_000_000, // ₹10 crore
  maxViewThreshold: 10_000_000_000,
  maxMilestones: 10,
} as const;

const milestoneSchema = z.object({
  viewThreshold: wholeNumber('Milestone views', { min: 1, max: LIMITS.maxViewThreshold }),
  payout: wholeNumber('Milestone payout', { min: 1, max: LIMITS.maxBudget }),
});

export const createCampaignSchema = z
  .object({
    name: requiredText('Campaign name', { min: 3, max: 100 }),
    platform: pickedOption('Platform', PLATFORMS),
    totalBudget: wholeNumber('Total budget', { min: 1, max: LIMITS.maxBudget }),
    milestones: z
      .array(milestoneSchema, { error: () => 'At least one milestone is required.' })
      .min(1, 'At least one milestone is required.')
      .max(LIMITS.maxMilestones, `A campaign can have at most ${LIMITS.maxMilestones} milestones.`)
      // Store the ladder in ascending order regardless of how it was entered.
      .transform((milestones) => [...milestones].sort((a, b) => a.viewThreshold - b.viewThreshold)),
  })
  .superRefine(({ milestones, totalBudget }, ctx) => {
    for (let i = 1; i < milestones.length; i++) {
      const lower = milestones[i - 1];
      const higher = milestones[i];
      if (higher.viewThreshold === lower.viewThreshold) {
        ctx.addIssue({
          code: 'custom',
          path: ['milestones'],
          message: `Two milestones use the same view count (${formatNumber(higher.viewThreshold)}). Each milestone needs a different view count.`,
        });
        return;
      }
      if (higher.payout <= lower.payout) {
        ctx.addIssue({
          code: 'custom',
          path: ['milestones'],
          message: `The ${formatNumber(higher.viewThreshold)}-view milestone must pay more than the ${formatNumber(lower.viewThreshold)}-view milestone.`,
        });
        return;
      }
    }
    const topPayout = milestones.at(-1)?.payout ?? 0;
    if (topPayout > totalBudget) {
      ctx.addIssue({
        code: 'custom',
        path: ['milestones'],
        message: `Milestone payout must be between 1 and ${formatNumber(totalBudget)} (the total budget).`,
      });
    }
  });

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
