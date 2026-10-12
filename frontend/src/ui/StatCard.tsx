import type { ReactNode } from 'react';
import { Card } from './Card';
import styles from './ui.module.css';

interface StatCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  caption?: string;
  tone?: 'primary' | 'success' | 'warning';
}

const TONE_CLASS: Record<NonNullable<StatCardProps['tone']>, string> = {
  primary: '',
  success: styles.statIconSuccess,
  warning: styles.statIconWarning,
};

export function StatCard({ label, value, icon, caption, tone = 'primary' }: StatCardProps) {
  return (
    <Card className={styles.stat}>
      <span className={`${styles.statIcon} ${TONE_CLASS[tone]}`}>{icon}</span>
      <div className={styles.statBody}>
        <span className={styles.statLabel}>{label}</span>
        <span className={styles.statValue}>{value}</span>
        {caption && <span className={styles.statCaption}>{caption}</span>}
      </div>
    </Card>
  );
}
