'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import type { Session } from '@/lib/session';
import type { UserRole } from '@/lib/types';
import styles from './auth.module.css';
import { homePathFor, useSession } from './useSession';

/** Where to send the user instead, or null if they may see a page meant for `role` (or any role if omitted). */
function redirectFor(session: Session | null | undefined, role?: UserRole): string | null {
  if (session === undefined) return null; // still loading
  if (session === null) return '/login';
  if (role && session.user.role !== role) return homePathFor(session);
  return null;
}

interface RoleGateProps {
  role: UserRole;
  children: ReactNode;
}

/** Renders `children` only for a logged-in user with `role`; redirects everyone else. */
export function RoleGate({ role, children }: RoleGateProps) {
  const session = useSession();
  const router = useRouter();
  const redirectTo = redirectFor(session, role);

  useEffect(() => {
    if (redirectTo) router.replace(redirectTo);
  }, [redirectTo, router]);

  if (session === undefined || redirectTo) {
    return <p className={styles.loading}>Loading…</p>;
  }
  return <>{children}</>;
}

/** Keeps logged-in users off the login/signup pages. */
export function GuestOnly({ children }: { children: ReactNode }) {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) router.replace(homePathFor(session));
  }, [session, router]);

  if (session !== null) {
    return <p className={styles.loading}>Loading…</p>;
  }
  return <>{children}</>;
}
