import type { CreateCampaignPayload, Platform } from '@/lib/types';

/** Form state keeps numbers as the raw input strings so a half-typed value isn't coerced early. */
export interface MilestoneRow {
  rowId: number;
  viewThreshold: string;
  payout: string;
}

export interface CampaignFormState {
  name: string;
  platform: Platform | '';
  totalBudget: string;
  milestones: MilestoneRow[];
}

let nextRowId = 0;

export function newMilestoneRow(viewThreshold = '', payout = ''): MilestoneRow {
  nextRowId += 1;
  return { rowId: nextRowId, viewThreshold, payout };
}

/** Pre-filled with the example ladder from the brief, so a brand can see the expected shape. */
export function initialCampaignForm(): CampaignFormState {
  return {
    name: '',
    platform: '',
    totalBudget: '',
    milestones: [newMilestoneRow('10000', '500'), newMilestoneRow('50000', '2000'), newMilestoneRow('100000', '5000')],
  };
}

/** '' → undefined (so the API reports the field as required); otherwise the parsed number. */
function toOptionalNumber(raw: string): number | undefined {
  const trimmed = raw.replace(/,/g, '').trim();
  if (trimmed === '') return undefined;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : undefined;
}

/**
 * Converts the form into the API request body. Validation itself is left to the API, which is the
 * single source of truth and returns field-labelled messages; completely blank milestone rows are
 * dropped as they're just unused rows, not mistakes.
 */
export function toCampaignPayload(form: CampaignFormState): CreateCampaignPayload {
  return {
    name: form.name.trim(),
    platform: form.platform,
    totalBudget: toOptionalNumber(form.totalBudget),
    milestones: form.milestones
      .filter((row) => row.viewThreshold.trim() !== '' || row.payout.trim() !== '')
      .map((row) => ({ viewThreshold: toOptionalNumber(row.viewThreshold), payout: toOptionalNumber(row.payout) })),
  };
}
