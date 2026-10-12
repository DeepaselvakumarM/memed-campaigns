import { formatRupees } from '@/lib/format';
import type { Earnings } from '@/lib/types';
import { Card } from '@/ui/Card';
import styles from './creator.module.css';

interface StatProps {
  label: string;
  value: string;
  highlight?: boolean;
}

function Stat({ label, value, highlight = false }: StatProps) {
  return (
    <Card className={styles.stat}>
      <span className={styles.statLabel}>{label}</span>
      <span className={`${styles.statValue} ${highlight ? styles.statHighlight : ''}`}>{value}</span>
    </Card>
  );
}

export function EarningsSummary({ earnings }: { earnings: Earnings }) {
  return (
    <div className={styles.stats}>
      <Stat label="Total earnings (paid)" value={formatRupees(earnings.totalEarnings)} highlight />
      <Stat label="Posts submitted" value={String(earnings.submissionCount)} />
      {earnings.unpaidDueToBudget > 0 && (
        <Stat label="Earned but unpaid (budget ran out)" value={formatRupees(earnings.unpaidDueToBudget)} />
      )}
    </div>
  );
}
