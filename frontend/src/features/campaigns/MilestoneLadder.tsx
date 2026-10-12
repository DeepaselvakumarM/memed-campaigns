import { formatRupees, formatViews } from '@/lib/format';
import type { Milestone } from '@/lib/types';
import { CheckIcon } from '@/ui/icons';
import styles from './campaigns.module.css';

interface MilestoneLadderProps {
  milestones: readonly Milestone[];
  /** Highlights milestones a post has reached, up to and including this threshold. */
  reachedThreshold?: number | null;
}

export function MilestoneLadder({ milestones, reachedThreshold = null }: MilestoneLadderProps) {
  return (
    <div className={styles.ladderWrap}>
      <span className={styles.ladderLabel}>Payouts</span>
      <ol className={styles.ladder} aria-label="Milestone payouts">
        {milestones.map((milestone) => {
          const reached = reachedThreshold !== null && milestone.viewThreshold <= reachedThreshold;
          return (
            <li key={milestone.viewThreshold} className={reached ? styles.reached : undefined}>
              {reached && <CheckIcon size={13} />}
              <span>{formatViews(milestone.viewThreshold)} views</span>
              <strong>{formatRupees(milestone.payout)}</strong>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
