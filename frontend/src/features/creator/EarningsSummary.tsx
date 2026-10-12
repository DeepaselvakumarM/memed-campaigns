import { formatRupees, formatViews } from '@/lib/format';
import type { Earnings } from '@/lib/types';
import { AlertIcon, ChartIcon, FileIcon, WalletIcon } from '@/ui/icons';
import { StatGrid } from '@/ui/Page';
import { StatCard } from '@/ui/StatCard';

export function EarningsSummary({ earnings }: { earnings: Earnings }) {
  const totalViews = earnings.submissions.reduce((sum, submission) => sum + submission.views, 0);

  return (
    <StatGrid label="Earnings overview">
      <StatCard label="Total earnings (paid)" value={formatRupees(earnings.totalEarnings)} icon={<WalletIcon />} tone="success" />
      <StatCard label="Posts submitted" value={String(earnings.submissionCount)} icon={<FileIcon />} />
      <StatCard label="Total views" value={formatViews(totalViews)} icon={<ChartIcon />} />
      {earnings.unpaidDueToBudget > 0 && (
        <StatCard
          label="Earned but unpaid (budget ran out)"
          value={formatRupees(earnings.unpaidDueToBudget)}
          icon={<AlertIcon />}
          tone="warning"
        />
      )}
    </StatGrid>
  );
}
