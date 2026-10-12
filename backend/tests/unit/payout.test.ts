import { calculatePayout, findHighestMilestone, findNextMilestone, type Milestone } from '../../src/services/payout';

// The ladder from the brief: 10K → ₹500, 50K → ₹2,000, 100K → ₹5,000.
const LADDER: Milestone[] = [
  { viewThreshold: 10_000, payout: 500 },
  { viewThreshold: 50_000, payout: 2_000 },
  { viewThreshold: 100_000, payout: 5_000 },
];

const UNLIMITED = 1_000_000;

describe('findHighestMilestone', () => {
  it.each([
    [0, null],
    [9_999, null],
    [10_000, 500], // reaching the threshold exactly counts as crossing it
    [49_999, 500],
    [50_000, 2_000],
    [99_999, 2_000],
    [100_000, 5_000],
    [10_000_000, 5_000],
  ])('at %i views the highest milestone pays %p', (views, expectedPayout) => {
    expect(findHighestMilestone(views, LADDER)?.payout ?? null).toBe(expectedPayout);
  });

  it('does not depend on the order the ladder is stored in', () => {
    const shuffled = [LADDER[2], LADDER[0], LADDER[1]];
    expect(findHighestMilestone(60_000, shuffled)).toEqual(LADDER[1]);
  });

  it('returns null for an empty ladder', () => {
    expect(findHighestMilestone(1_000_000, [])).toBeNull();
  });
});

describe('findNextMilestone', () => {
  it('returns the lowest milestone not yet reached', () => {
    expect(findNextMilestone(0, LADDER)).toEqual(LADDER[0]);
    expect(findNextMilestone(10_000, LADDER)).toEqual(LADDER[1]);
    expect(findNextMilestone(75_000, LADDER)).toEqual(LADDER[2]);
  });

  it('returns null once every milestone is reached', () => {
    expect(findNextMilestone(100_000, LADDER)).toBeNull();
  });
});

describe('calculatePayout: milestone payouts', () => {
  it('pays nothing below the first milestone', () => {
    expect(calculatePayout({ views: 9_999, milestones: LADDER, alreadyPaid: 0, remainingBudget: UNLIMITED })).toEqual({
      milestone: null,
      entitledAmount: 0,
      payoutNow: 0,
      newPaidAmount: 0,
      cappedByBudget: false,
    });
  });

  it('pays the highest milestone crossed, not the sum of all crossed milestones', () => {
    const result = calculatePayout({ views: 120_000, milestones: LADDER, alreadyPaid: 0, remainingBudget: UNLIMITED });
    expect(result.entitledAmount).toBe(5_000); // not 500 + 2,000 + 5,000
    expect(result.payoutNow).toBe(5_000);
    expect(result.milestone).toEqual(LADDER[2]);
  });

  it('pays only the difference when a post climbs to a higher milestone', () => {
    const result = calculatePayout({ views: 55_000, milestones: LADDER, alreadyPaid: 500, remainingBudget: UNLIMITED });
    expect(result.payoutNow).toBe(1_500);
    expect(result.newPaidAmount).toBe(2_000);
  });

  it('pays nothing again for a milestone that was already paid (idempotent updates)', () => {
    const result = calculatePayout({ views: 70_000, milestones: LADDER, alreadyPaid: 2_000, remainingBudget: UNLIMITED });
    expect(result.payoutNow).toBe(0);
    expect(result.newPaidAmount).toBe(2_000);
    expect(result.cappedByBudget).toBe(false);
  });

  it('never returns a negative payout when more was already paid than the current entitlement', () => {
    const result = calculatePayout({ views: 10_000, milestones: LADDER, alreadyPaid: 2_000, remainingBudget: UNLIMITED });
    expect(result.payoutNow).toBe(0);
    expect(result.newPaidAmount).toBe(2_000);
  });

  it('a series of updates adds up to exactly the highest milestone', () => {
    let paid = 0;
    for (const views of [5_000, 10_000, 30_000, 50_000, 99_000, 100_000, 250_000]) {
      paid = calculatePayout({ views, milestones: LADDER, alreadyPaid: paid, remainingBudget: UNLIMITED }).newPaidAmount;
    }
    expect(paid).toBe(5_000);
  });
});

describe('calculatePayout: budget cap', () => {
  it('pays in full when the remaining budget covers it exactly', () => {
    const result = calculatePayout({ views: 50_000, milestones: LADDER, alreadyPaid: 0, remainingBudget: 2_000 });
    expect(result.payoutNow).toBe(2_000);
    expect(result.cappedByBudget).toBe(false);
  });

  it('pays only the remaining budget when it cannot cover the full amount', () => {
    const result = calculatePayout({ views: 100_000, milestones: LADDER, alreadyPaid: 0, remainingBudget: 1_200 });
    expect(result.entitledAmount).toBe(5_000);
    expect(result.payoutNow).toBe(1_200);
    expect(result.newPaidAmount).toBe(1_200);
    expect(result.cappedByBudget).toBe(true);
  });

  it('caps the incremental payout, not the total entitlement', () => {
    // Already paid ₹500; climbing to ₹2,000 needs ₹1,500 more but only ₹300 is left.
    const result = calculatePayout({ views: 50_000, milestones: LADDER, alreadyPaid: 500, remainingBudget: 300 });
    expect(result.payoutNow).toBe(300);
    expect(result.newPaidAmount).toBe(800);
    expect(result.cappedByBudget).toBe(true);
  });

  it('pays nothing when the budget is exhausted', () => {
    const result = calculatePayout({ views: 100_000, milestones: LADDER, alreadyPaid: 0, remainingBudget: 0 });
    expect(result.payoutNow).toBe(0);
    expect(result.cappedByBudget).toBe(true);
  });

  it('does not flag a cap when nothing was owed, even with no budget left', () => {
    const result = calculatePayout({ views: 5_000, milestones: LADDER, alreadyPaid: 0, remainingBudget: 0 });
    expect(result.cappedByBudget).toBe(false);
  });

  it('never pays more than the remaining budget across many submissions', () => {
    const totalBudget = 6_000;
    let spent = 0;
    // Five posts each reaching the top milestone (₹5,000 each) against a ₹6,000 budget.
    for (let i = 0; i < 5; i++) {
      const { payoutNow } = calculatePayout({
        views: 100_000,
        milestones: LADDER,
        alreadyPaid: 0,
        remainingBudget: totalBudget - spent,
      });
      spent += payoutNow;
      expect(spent).toBeLessThanOrEqual(totalBudget);
    }
    expect(spent).toBe(totalBudget);
  });
});

describe('calculatePayout: input guards', () => {
  it.each([
    ['views', { views: -1, alreadyPaid: 0, remainingBudget: 0 }],
    ['views', { views: 1.5, alreadyPaid: 0, remainingBudget: 0 }],
    ['alreadyPaid', { views: 0, alreadyPaid: -100, remainingBudget: 0 }],
    ['remainingBudget', { views: 0, alreadyPaid: 0, remainingBudget: -1 }],
  ])('rejects an invalid %s', (label, input) => {
    expect(() => calculatePayout({ ...input, milestones: LADDER })).toThrow(new RegExp(`^${label}`));
  });
});
