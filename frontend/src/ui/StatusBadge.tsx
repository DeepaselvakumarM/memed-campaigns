import type { ReactNode } from 'react';
import styles from './ui.module.css';

export function StatusBadge({ isLive }: { isLive: boolean }) {
  return (
    <span className={`${styles.badge} ${isLive ? styles.badgeLive : styles.badgeEnded}`}>
      <span className={styles.dot} aria-hidden="true" />
      {isLive ? 'Live' : 'Budget used up'}
    </span>
  );
}

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={[styles.badge, className].filter(Boolean).join(' ')}>{children}</span>;
}
