import type { ReactNode } from 'react';
import styles from './ui.module.css';

/** Centered, padded content column used by every dashboard. */
export function Page({ children }: { children: ReactNode }) {
  return <main className={styles.page}>{children}</main>;
}

/** Responsive grid of StatCards. */
export function StatGrid({ children, label }: { children: ReactNode; label: string }) {
  return (
    <section className={styles.statGrid} aria-label={label}>
      {children}
    </section>
  );
}
