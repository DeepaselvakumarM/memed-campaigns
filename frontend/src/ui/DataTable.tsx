import type { ReactNode, TdHTMLAttributes } from 'react';
import { ExternalIcon } from './icons';
import styles from './ui.module.css';

/** A table that scrolls on tablets and stacks each row into a card on phones; callers supply <thead>/<tbody>. */
export function DataTable({ children }: { children: ReactNode }) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>{children}</table>
    </div>
  );
}

interface CellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  /** Column name, shown beside the value when rows stack into cards on small screens. */
  label: string;
}

export function Cell({ label, ...rest }: CellProps) {
  return <td data-label={label} {...rest} />;
}

/** A submitted post's URL, opened in a new tab. */
export function PostLink({ url }: { url: string }) {
  const display = url.replace(/^https?:\/\//, '');
  return (
    <a className={styles.postLink} href={url} target="_blank" rel="noreferrer noopener" title={url}>
      <span className={styles.postLinkText}>{display}</span>
      <ExternalIcon size={14} />
    </a>
  );
}
