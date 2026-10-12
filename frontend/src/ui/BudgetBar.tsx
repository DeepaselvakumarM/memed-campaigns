import { formatRupees, percentSpent } from '@/lib/format';
import styles from './ui.module.css';

interface BudgetBarProps {
  spent: number;
  total: number;
}

export function BudgetBar({ spent, total }: BudgetBarProps) {
  const percent = percentSpent(spent, total);
  const remaining = total - spent;

  return (
    <div className={styles.budget}>
      <div className={styles.budgetFigures}>
        <span className={styles.budgetSpent}>
          {formatRupees(spent)} <span className={styles.budgetOf}>spent of {formatRupees(total)}</span>
        </span>
        <span className={styles.budgetLeft}>
          <strong>{formatRupees(remaining)}</strong> left · {percent}% used
        </span>
      </div>
      <div
        className={styles.track}
        role="progressbar"
        aria-label="Budget spent"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={spent}
        aria-valuetext={`${formatRupees(spent)} of ${formatRupees(total)} spent`}
      >
        <div className={`${styles.fill} ${remaining <= 0 ? styles.fillFull : ''}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
