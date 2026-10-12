import type { ReactNode } from 'react';
import styles from './ui.module.css';

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageHeader({ eyebrow, title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className={styles.pageHeader}>
      <div>
        <p className={styles.pageEyebrow}>{eyebrow}</p>
        <h1 className={styles.pageTitle}>{title}</h1>
        {subtitle && <p className={styles.pageSubtitle}>{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}

interface SectionHeadingProps {
  id: string;
  title: string;
  count?: number;
}

export function SectionHeading({ id, title, count }: SectionHeadingProps) {
  return (
    <div className={styles.sectionHeading}>
      <h2 id={id} className={styles.sectionTitle}>
        {title}
      </h2>
      {count !== undefined && <span className={styles.sectionCount}>{count}</span>}
    </div>
  );
}
