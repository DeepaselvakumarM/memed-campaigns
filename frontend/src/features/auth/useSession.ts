'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback, useSyncExternalStore } from 'react';
import { sessionStore, type Session } from '@/lib/session';

/** `undefined` while unknown (server render / hydration), `null` when logged out. */
export function useSession(): Session | null | undefined {
  return useSyncExternalStore(sessionStore.subscribe, sessionStore.getSnapshot, sessionStore.getServerSnapshot);
}

/** Path of the dashboard for the session's role, or the login page when logged out. */
export function homePathFor(session: Session | null): string {
  return session ? `/${session.user.role}` : '/login';
}

export function useLogout(): () => void {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useCallback(() => {
    sessionStore.set(null);
    // Drop the previous user's cached data so the next account never sees it.
    queryClient.clear();
    router.replace('/login');
  }, [queryClient, router]);
}
