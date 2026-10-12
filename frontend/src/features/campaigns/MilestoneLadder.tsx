import { formatRupees, formatViews } from '@/lib/format';
import type { Milestone } from '@/lib/types';
import styles from './campaigns.module.css';

interface MilestoneLadderProps {
  milestones: readonly Milestone[];
  /** Highlights the milestone this post has reached, if any. */
  reachedThreshold?: number | null;
}

export function MilestoneLadder({ milestones, reachedThreshold = null }: MilestoneLadderProps) {
  return (
    <ol className={styles.ladder} aria-label="Milestone payouts">
      {milestones.map((milestone) => (
        <li
          key={milestone.viewThreshold}
          className={milestone.viewThreshold === reachedThreshold ? styles.reached : undefined}
        >
          <span>{formatViews(milestone.viewThreshold)} views</span>
          <strong>{formatRupees(milestone.payout)}</strong>
        </li>
      ))}
    </ol>
  );
}
