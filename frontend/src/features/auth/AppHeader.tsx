'use client';

import { Button } from '@/ui/Button';
import { LogoutIcon } from '@/ui/icons';
import { Logo } from '@/ui/Logo';
import styles from './auth.module.css';
import { useLogout, useSession } from './useSession';

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? (parts.at(-1)?.[0] ?? '') : '')).toUpperCase();
}

export function AppHeader() {
  const session = useSession();
  const logout = useLogout();

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Logo />
        {session && (
          <div className={styles.headerUser}>
            <span className={styles.avatar} aria-hidden="true">
              {initialsOf(session.user.name)}
            </span>
            <span className={styles.userMeta}>
              <span className={styles.userName}>{session.user.name}</span>
              <span className={styles.userRole}>{session.user.role === 'brand' ? 'Brand account' : 'Creator account'}</span>
            </span>
            <Button variant="secondary" onClick={logout} aria-label="Log out">
              <LogoutIcon size={16} />
              <span className={styles.logoutLabel}>Log out</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
