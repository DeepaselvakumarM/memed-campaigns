import type { Session } from './session';

const SESSION: Session = {
  token: 'jwt-token',
  user: { id: 'u1', name: 'Acme', email: 'acme@test.com', role: 'brand' },
};

// The store caches its first read, so each test gets a fresh module.
async function loadStore() {
  jest.resetModules();
  return import('./session');
}

beforeEach(() => window.localStorage.clear());

describe('sessionStore', () => {
  it('persists a session and notifies subscribers', async () => {
    const { sessionStore, getSessionToken } = await loadStore();
    const listener = jest.fn();
    const unsubscribe = sessionStore.subscribe(listener);

    sessionStore.set(SESSION);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(getSessionToken()).toBe('jwt-token');
    expect(JSON.parse(window.localStorage.getItem('memed.session') ?? 'null')).toEqual(SESSION);
    unsubscribe();
  });

  it('restores a stored session on load', async () => {
    window.localStorage.setItem('memed.session', JSON.stringify(SESSION));
    const { sessionStore } = await loadStore();
    expect(sessionStore.getSnapshot()).toEqual(SESSION);
  });

  it.each([
    ['corrupt JSON', '{not json'],
    ['an unknown role', JSON.stringify({ ...SESSION, user: { ...SESSION.user, role: 'admin' } })],
    ['a missing token', JSON.stringify({ user: SESSION.user })],
  ])('treats %s as logged out', async (_label, stored) => {
    window.localStorage.setItem('memed.session', stored);
    const { sessionStore } = await loadStore();
    expect(sessionStore.getSnapshot()).toBeNull();
  });

  it('clears the stored session on logout', async () => {
    const { sessionStore } = await loadStore();
    sessionStore.set(SESSION);
    sessionStore.set(null);
    expect(window.localStorage.getItem('memed.session')).toBeNull();
    expect(sessionStore.getSnapshot()).toBeNull();
  });
});
