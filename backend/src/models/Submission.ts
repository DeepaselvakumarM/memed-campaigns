import { Schema, model, type Types } from 'mongoose';

export interface ISubmission {
  campaign: Types.ObjectId;
  creator: Types.ObjectId;
  /** Normalized post URL; unique so the same post can never be paid twice. */
  postUrl: string;
  views: number;
  /** View threshold of the highest milestone crossed, or null if none yet. */
  reachedMilestone: number | null;
  /** Payout of the highest milestone crossed (what the creator has earned on paper). */
  entitledAmount: number;
  /** What has actually been paid. Lower than entitledAmount only when the budget ran out. */
  paidAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const submissionSchema = new Schema<ISubmission>(
  {
    campaign: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    postUrl: { type: String, required: true, unique: true, trim: true },
    views: { type: Number, required: true, default: 0, min: 0 },
    reachedMilestone: { type: Number, default: null },
    entitledAmount: { type: Number, required: true, default: 0, min: 0 },
    paidAmount: { type: Number, required: true, default: 0, min: 0 },
  },
  { timestamps: true },
);

submissionSchema.index({ creator: 1, createdAt: -1 });
submissionSchema.index({ campaign: 1, createdAt: -1 });

export const Submission = model<ISubmission>('Submission', submissionSchema);
