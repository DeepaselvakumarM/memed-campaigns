import type { ReactNode } from 'react';
import styles from './ui.module.css';

interface AlertProps {
  tone: 'error' | 'success' | 'warning' | 'info';
  children: ReactNode;
}

/** Errors are announced immediately to screen readers; other tones politely. */
export function Alert({ tone, children }: AlertProps) {
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`${styles.alert} ${styles[tone]}`}>
      {children}
    </div>
  );
}
