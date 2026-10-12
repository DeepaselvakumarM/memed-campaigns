import type { Platform } from './types';

const rupeeFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

// Views use K/M (as in the brief: "10K views"); money keeps Indian grouping.
const compactFormatter = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
const numberFormatter = new Intl.NumberFormat('en-IN');

/** ₹1,20,000 */
export function formatRupees(amount: number): string {
  return rupeeFormatter.format(amount);
}

/** 1,20,000 */
export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

/** 10K, 1.5M: compact view counts for milestone labels. */
export function formatViews(views: number): string {
  return compactFormatter.format(views);
}

export const PLATFORM_LABELS: Record<Platform, string> = {
  instagram: 'Instagram',
  youtube: 'YouTube',
};

/** Share of the budget spent, 0–100, rounded down so "100%" only appears when fully spent. */
export function percentSpent(spent: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.floor((spent / total) * 100));
}
