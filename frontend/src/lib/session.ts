import type { AuthResponse, User, UserRole } from './types';

/**
 * The logged-in session (JWT + user), persisted in localStorage and exposed as an external store
 * so components can read it with `useSyncExternalStore`.
 *
 * Snapshot values: `undefined` = not known yet (server render / before hydration),
 * `null` = logged out, otherwise the session.
 */
export type Session = AuthResponse;

const STORAGE_KEY = 'memed.session';
const ROLES: readonly UserRole[] = ['brand', 'creator'];
const listeners = new Set<() => void>();
let cachedSession: Session | null | undefined;

function isSession(value: unknown): value is Session {
  if (typeof value !== 'object' || value === null) return false;
  const { token, user } = value as { token?: unknown; user?: Partial<User> };
  return typeof token === 'string' && typeof user?.id === 'string' && ROLES.includes(user.role as UserRole);
}

function readStoredSession(): Session | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return isSession(parsed) ? parsed : null;
  } catch {
    return null; // blocked storage or corrupt value: treat as logged out
  }
}

function notify(): void {
  listeners.forEach((listener) => listener());
}

function onStorage(event: StorageEvent): void {
  // Keeps tabs in sync: logging out in one tab logs out the others.
  if (event.key === STORAGE_KEY) {
    cachedSession = readStoredSession();
    notify();
  }
}

export const sessionStore = {
  subscribe(listener: () => void): () => void {
    if (listeners.size === 0) window.addEventListener('storage', onStorage);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) window.removeEventListener('storage', onStorage);
    };
  },

  getSnapshot(): Session | null {
    if (cachedSession === undefined) cachedSession = readStoredSession();
    return cachedSession;
  },

  getServerSnapshot(): Session | null | undefined {
    return undefined;
  },

  set(session: Session | null): void {
    cachedSession = session;
    try {
      if (session) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage unavailable: the session still works for this tab, it just won't survive a reload.
    }
    notify();
  },
};

export function getSessionToken(): string | undefined {
  return typeof window === 'undefined' ? undefined : (sessionStore.getSnapshot()?.token ?? undefined);
}
