import type { ReactNode } from 'react';
import styles from './ui.module.css';

/** A horizontally scrollable table; callers supply <thead>/<tbody>. */
export function DataTable({ children }: { children: ReactNode }) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>{children}</table>
    </div>
  );
}

/** A submitted post's URL, opened in a new tab. */
export function PostLink({ url }: { url: string }) {
  return (
    <a className={styles.postLink} href={url} target="_blank" rel="noreferrer noopener">
      {url}
    </a>
  );
}
