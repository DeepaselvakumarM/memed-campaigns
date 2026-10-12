'use client';

import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { ApiError } from '@/lib/apiClient';
import { sessionStore } from '@/lib/session';

let browserQueryClient: QueryClient | undefined;

/** An expired or invalid token on any request ends the session; RoleGate then redirects to login. */
function handleAuthError(error: Error): void {
  if (error instanceof ApiError && error.status === 401 && sessionStore.getSnapshot()) {
    sessionStore.set(null);
    browserQueryClient?.clear();
  }
}

function createQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({ onError: handleAuthError }),
    mutationCache: new MutationCache({ onError: handleAuthError }),
    defaultOptions: {
      queries: {
        staleTime: 15_000,
        // Retry network blips and 5xx, but not 4xx: those won't succeed on a retry.
        retry: (failureCount, error) =>
          !(error instanceof ApiError && error.status >= 400 && error.status < 500) && failureCount < 2,
      },
    },
  });
}

function getQueryClient(): QueryClient {
  // Keep server renders isolated and reuse one client (and its cache) in the browser.
  if (typeof window === 'undefined') return createQueryClient();
  browserQueryClient ??= createQueryClient();
  return browserQueryClient;
}

export function Providers({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={getQueryClient()}>{children}</QueryClientProvider>;
}
