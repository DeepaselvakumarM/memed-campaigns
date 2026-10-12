import styles from './ui.module.css';

export function StatusBadge({ isLive }: { isLive: boolean }) {
  return (
    <span className={`${styles.badge} ${isLive ? styles.badgeLive : styles.badgeEnded}`}>
      {isLive ? 'Live' : 'Budget used up'}
    </span>
  );
}

export function Badge({ children }: { children: string }) {
  return <span className={styles.badge}>{children}</span>;
}
