import styles from './logo.module.css';

export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <span className={`${styles.logo} ${inverted ? styles.inverted : ''}`}>
      <span className={styles.mark} aria-hidden="true">
        M
      </span>
      <span className={styles.word}>Meme&apos;d</span>
    </span>
  );
}
