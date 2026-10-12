import type { UserRole } from '@/lib/types';
import styles from './auth.module.css';

const ROLE_OPTIONS: { value: UserRole; title: string; description: string }[] = [
  { value: 'brand', title: 'Brand', description: 'Run campaigns and fund payouts' },
  { value: 'creator', title: 'Creator', description: 'Post content and earn per milestone' },
];

interface RolePickerProps {
  value: UserRole | '';
  onChange: (role: UserRole) => void;
}

export function RolePicker({ value, onChange }: RolePickerProps) {
  return (
    <fieldset className={styles.roleGroup}>
      <legend>Account type</legend>
      {ROLE_OPTIONS.map((option) => (
        <label key={option.value} className={styles.roleOption}>
          <input
            type="radio"
            name="role"
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
          />
          <span>
            <strong>{option.title}</strong>
            <small>{option.description}</small>
          </span>
        </label>
      ))}
    </fieldset>
  );
}
