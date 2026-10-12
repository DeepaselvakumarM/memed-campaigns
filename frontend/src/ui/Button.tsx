import type { ButtonHTMLAttributes } from 'react';
import styles from './ui.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  /** Stretch to the full width of the container. */
  block?: boolean;
  isLoading?: boolean;
  loadingText?: string;
}

export function Button({
  variant = 'primary',
  block = false,
  isLoading = false,
  loadingText,
  disabled,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  const classes = [styles.button, styles[variant], block ? styles.block : '', className];
  return (
    <button
      type={type}
      className={classes.filter(Boolean).join(' ')}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...rest}
    >
      {isLoading ? (loadingText ?? 'Please wait…') : children}
    </button>
  );
}
