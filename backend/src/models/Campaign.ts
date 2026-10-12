import { Schema, model, type Types } from 'mongoose';
import type { Milestone } from '../services/payout';

export const PLATFORMS = ['instagram', 'youtube'] as const;
export type Platform = (typeof PLATFORMS)[number];

export interface ICampaign {
  brand: Types.ObjectId;
  name: string;
  platform: Platform;
  /** Whole rupees. */
  totalBudget: number;
  /** Whole rupees already paid out. Invariant: 0 <= spentBudget <= totalBudget. */
  spentBudget: number;
  /** Sorted by viewThreshold ascending; payouts strictly increase up the ladder. */
  milestones: Milestone[];
  createdAt: Date;
  updatedAt: Date;
}

const milestoneSchema = new Schema<Milestone>(
  {
    viewThreshold: { type: Number, required: true, min: 1 },
    payout: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const campaignSchema = new Schema<ICampaign>(
  {
    brand: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    platform: { type: String, enum: PLATFORMS, required: true },
    totalBudget: { type: Number, required: true, min: 1 },
    spentBudget: { type: Number, required: true, default: 0, min: 0 },
    milestones: {
      type: [milestoneSchema],
      required: true,
      validate: {
        validator: (value: Milestone[]) => value.length > 0,
        message: 'At least one milestone is required.',
      },
    },
  },
  { timestamps: true },
);

// Guards the budget invariant on document saves. Payout updates use an atomic,
// cap-checked $inc instead (see submissionService.updateSubmissionViews).
campaignSchema.pre('validate', function () {
  if (this.spentBudget > this.totalBudget) {
    this.invalidate('spentBudget', 'Spent budget cannot exceed the total budget.');
  }
});

campaignSchema.index({ brand: 1, createdAt: -1 });
campaignSchema.index({ createdAt: -1 });

export const Campaign = model<ICampaign>('Campaign', campaignSchema);
