// Shapes returned by the backend API (mirrors the backend DTOs).

export type UserRole = 'brand' | 'creator';
export type Platform = 'instagram' | 'youtube';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Milestone {
  viewThreshold: number;
  payout: number;
}

export interface Campaign {
  id: string;
  name: string;
  platform: Platform;
  totalBudget: number;
  spentBudget: number;
  remainingBudget: number;
  milestones: Milestone[];
  isLive: boolean;
  brandName?: string;
  submissionCount?: number;
  createdAt: string;
}

export interface Submission {
  id: string;
  campaignId: string;
  campaignName: string;
  platform: Platform;
  postUrl: string;
  views: number;
  reachedMilestone: number | null;
  nextMilestone: Milestone | null;
  entitledAmount: number;
  paidAmount: number;
  unpaidDueToBudget: number;
  creatorName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Earnings {
  totalEarnings: number;
  totalEntitled: number;
  unpaidDueToBudget: number;
  submissionCount: number;
  submissions: Submission[];
}

export interface ViewUpdateResult {
  submission: Submission;
  paidNow: number;
  cappedByBudget: boolean;
  campaign: { id: string; spentBudget: number; remainingBudget: number };
}

export interface CreateCampaignPayload {
  name: string;
  platform: Platform | '';
  totalBudget?: number;
  milestones: { viewThreshold?: number; payout?: number }[];
}
