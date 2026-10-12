import { initialCampaignForm, newMilestoneRow, toCampaignPayload, type CampaignFormState } from './campaignForm';

function form(overrides: Partial<CampaignFormState> = {}): CampaignFormState {
  return { name: 'Diwali Launch', platform: 'instagram', totalBudget: '10000', milestones: [], ...overrides };
}

describe('toCampaignPayload', () => {
  it('converts numeric inputs to numbers and trims the name', () => {
    const payload = toCampaignPayload(
      form({ name: '  Diwali Launch  ', milestones: [newMilestoneRow('10000', '500'), newMilestoneRow('50,000', '2,000')] }),
    );
    expect(payload).toEqual({
      name: 'Diwali Launch',
      platform: 'instagram',
      totalBudget: 10000,
      milestones: [
        { viewThreshold: 10000, payout: 500 },
        { viewThreshold: 50000, payout: 2000 },
      ],
    });
  });

  it('sends blank numbers as missing so the API can report them as required', () => {
    const payload = toCampaignPayload(form({ totalBudget: '  ', milestones: [newMilestoneRow('10000', '')] }));
    expect(payload.totalBudget).toBeUndefined();
    expect(payload.milestones).toEqual([{ viewThreshold: 10000, payout: undefined }]);
  });

  it('drops completely empty milestone rows', () => {
    const payload = toCampaignPayload(form({ milestones: [newMilestoneRow('', ''), newMilestoneRow('10000', '500')] }));
    expect(payload.milestones).toHaveLength(1);
  });
});

describe('initialCampaignForm', () => {
  it('starts with the example ladder from the brief and unique row ids', () => {
    const initial = initialCampaignForm();
    expect(initial.milestones.map((row) => [row.viewThreshold, row.payout])).toEqual([
      ['10000', '500'],
      ['50000', '2000'],
      ['100000', '5000'],
    ]);
    expect(new Set(initial.milestones.map((row) => row.rowId)).size).toBe(3);
  });
});
