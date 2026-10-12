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
      <div className={styles.budgetLegend}>
        <span>
          Spent <strong>{formatRupees(spent)}</strong> ({percent}%)
        </span>
        <span>
          Remaining <strong>{formatRupees(remaining)}</strong> of {formatRupees(total)}
        </span>
      </div>
    </div>
  );
}
