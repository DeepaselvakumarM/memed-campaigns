import { createCampaignSchema } from '../../src/validation/campaign.schemas';

const valid = {
  name: 'Diwali Launch',
  platform: 'instagram',
  totalBudget: 10_000,
  milestones: [
    { viewThreshold: 10_000, payout: 500 },
    { viewThreshold: 50_000, payout: 2_000 },
  ],
};

function firstError(input: unknown): string | undefined {
  const result = createCampaignSchema.safeParse(input);
  return result.success ? undefined : result.error.issues[0]?.message;
}

describe('createCampaignSchema', () => {
  it('accepts a valid campaign and sorts the ladder by view threshold', () => {
    const parsed = createCampaignSchema.parse({ ...valid, milestones: [...valid.milestones].reverse() });
    expect(parsed.milestones.map((m) => m.viewThreshold)).toEqual([10_000, 50_000]);
  });

  it('treats a zero budget as missing', () => {
    expect(firstError({ ...valid, totalBudget: 0 })).toBe('Total budget is required.');
  });

  it('rejects a fractional budget', () => {
    expect(firstError({ ...valid, totalBudget: 99.5 })).toBe('Total budget must be a whole number.');
  });

  it('requires at least one milestone', () => {
    expect(firstError({ ...valid, milestones: [] })).toBe('At least one milestone is required.');
  });

  it('rejects two milestones with the same view count', () => {
    expect(
      firstError({
        ...valid,
        milestones: [
          { viewThreshold: 10_000, payout: 500 },
          { viewThreshold: 10_000, payout: 900 },
        ],
      }),
    ).toMatch(/same view count/);
  });

  it('rejects a ladder where a higher milestone does not pay more', () => {
    expect(
      firstError({
        ...valid,
        milestones: [
          { viewThreshold: 10_000, payout: 500 },
          { viewThreshold: 50_000, payout: 500 },
        ],
      }),
    ).toMatch(/must pay more than/);
  });

  it('rejects a milestone payout larger than the total budget', () => {
    expect(firstError({ ...valid, totalBudget: 1_000 })).toBe(
      'Milestone payout must be between 1 and 1,000 (the total budget).',
    );
  });

  it('names an unknown platform as an unrecognized option, not a format', () => {
    expect(firstError({ ...valid, platform: 'tiktok' })).toBe(
      'Platform is not a recognized option. Please select it again.',
    );
  });
});
