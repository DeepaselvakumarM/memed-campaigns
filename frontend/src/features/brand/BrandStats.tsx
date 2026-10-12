import { formatRupees } from '@/lib/format';
import type { Campaign } from '@/lib/types';
import { ChartIcon, MegaphoneIcon, WalletIcon } from '@/ui/icons';
import { StatGrid } from '@/ui/Page';
import { StatCard } from '@/ui/StatCard';

interface BudgetTotals {
  liveCount: number;
  totalBudget: number;
  spent: number;
  remaining: number;
}

function sumBudgets(campaigns: readonly Campaign[]): BudgetTotals {
  return campaigns.reduce<BudgetTotals>(
    (totals, campaign) => ({
      liveCount: totals.liveCount + (campaign.isLive ? 1 : 0),
      totalBudget: totals.totalBudget + campaign.totalBudget,
      spent: totals.spent + campaign.spentBudget,
      remaining: totals.remaining + campaign.remainingBudget,
    }),
    { liveCount: 0, totalBudget: 0, spent: 0, remaining: 0 },
  );
}

export function BrandStats({ campaigns }: { campaigns: readonly Campaign[] }) {
  const totals = sumBudgets(campaigns);
  return (
    <StatGrid label="Budget overview">
      <StatCard
        label="Live campaigns"
        value={String(totals.liveCount)}
        caption={`${campaigns.length} in total`}
        icon={<MegaphoneIcon />}
      />
      <StatCard label="Total budget" value={formatRupees(totals.totalBudget)} icon={<WalletIcon />} />
      <StatCard label="Paid to creators" value={formatRupees(totals.spent)} icon={<ChartIcon />} tone="success" />
      <StatCard label="Budget remaining" value={formatRupees(totals.remaining)} icon={<WalletIcon />} tone="warning" />
    </StatGrid>
  );
}
