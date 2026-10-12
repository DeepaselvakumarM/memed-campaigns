import { useId, type InputHTMLAttributes } from 'react';
import styles from './ui.module.css';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  /** Visually hide the label (it stays available to screen readers). */
  hideLabel?: boolean;
}

export function TextField({ label, hint, hideLabel = false, id, ...inputProps }: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;

  return (
    <div className={styles.field}>
      <label htmlFor={inputId} className={hideLabel ? 'visually-hidden' : styles.label}>
        {label}
      </label>
      <input id={inputId} className={styles.input} aria-describedby={hintId} {...inputProps} />
      {hint && (
        <span id={hintId} className={styles.hint}>
          {hint}
        </span>
      )}
    </div>
  );
}
