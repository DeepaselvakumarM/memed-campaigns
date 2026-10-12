/**
 * Pure payout logic — no database or framework imports, so it can be unit-tested in isolation.
 * All money values are whole rupees (integers).
 */

export interface Milestone {
  /** A post "crosses" the milestone once views >= viewThreshold. */
  viewThreshold: number;
  /** Total amount (not incremental) the creator earns for reaching this milestone. */
  payout: number;
}

export interface PayoutInput {
  views: number;
  milestones: readonly Milestone[];
  /** Amount already paid to this submission by earlier view updates. */
  alreadyPaid: number;
  /** Campaign's totalBudget - spentBudget at the time of calculation. */
  remainingBudget: number;
}

export interface PayoutResult {
  /** Highest milestone crossed, or null if no milestone is reached. */
  milestone: Milestone | null;
  /** What the creator is owed in total: the payout of the highest milestone crossed. */
  entitledAmount: number;
  /** Additional amount to pay now (after the budget cap). Never negative. */
  payoutNow: number;
  /** alreadyPaid + payoutNow. */
  newPaidAmount: number;
  /** True when the remaining budget stopped us paying the full outstanding amount. */
  cappedByBudget: boolean;
}

function assertNonNegativeInteger(value: number, label: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${label} must be a non-negative integer (received ${value}).`);
  }
}

/** Returns the milestone with the largest threshold that `views` has reached, or null. */
export function findHighestMilestone(views: number, milestones: readonly Milestone[]): Milestone | null {
  let highest: Milestone | null = null;
  for (const milestone of milestones) {
    if (views >= milestone.viewThreshold && (highest === null || milestone.viewThreshold > highest.viewThreshold)) {
      highest = milestone;
    }
  }
  return highest;
}

/** Returns the lowest milestone not yet reached (the creator's next target), or null if all are reached. */
export function findNextMilestone(views: number, milestones: readonly Milestone[]): Milestone | null {
  let next: Milestone | null = null;
  for (const milestone of milestones) {
    if (views < milestone.viewThreshold && (next === null || milestone.viewThreshold < next.viewThreshold)) {
      next = milestone;
    }
  }
  return next;
}

/**
 * Works out how much to pay a submission after a view-count update.
 *
 * - The creator is entitled to the payout of the HIGHEST milestone crossed (not the sum of all crossed).
 * - Only the difference between that entitlement and what was already paid is paid now,
 *   so repeated updates never pay the same milestone twice.
 * - The payment is capped at the campaign's remaining budget; if the budget can't cover it,
 *   the remaining budget is paid out (partial payment) and `cappedByBudget` is set.
 */
export function calculatePayout(input: PayoutInput): PayoutResult {
  const { views, milestones, alreadyPaid, remainingBudget } = input;
  assertNonNegativeInteger(views, 'views');
  assertNonNegativeInteger(alreadyPaid, 'alreadyPaid');
  assertNonNegativeInteger(remainingBudget, 'remainingBudget');

  const milestone = findHighestMilestone(views, milestones);
  const entitledAmount = milestone?.payout ?? 0;
  const outstanding = Math.max(0, entitledAmount - alreadyPaid);
  const payoutNow = Math.min(outstanding, remainingBudget);

  return {
    milestone,
    entitledAmount,
    payoutNow,
    newPaidAmount: alreadyPaid + payoutNow,
    cappedByBudget: payoutNow < outstanding,
  };
}
