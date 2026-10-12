'use client';

import { Button } from '@/ui/Button';
import { Badge } from '@/ui/StatusBadge';
import styles from './auth.module.css';
import { useLogout, useSession } from './useSession';

export function AppHeader() {
  const session = useSession();
  const logout = useLogout();

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <strong className={styles.brandMark}>Meme&apos;d</strong>
        {session && (
          <div className={styles.headerUser}>
            <span>{session.user.name}</span>
            <Badge>{session.user.role === 'brand' ? 'Brand' : 'Creator'}</Badge>
            <Button variant="secondary" onClick={logout}>
              Log out
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
