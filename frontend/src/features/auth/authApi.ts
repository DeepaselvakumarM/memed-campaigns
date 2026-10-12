'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/apiClient';
import { sessionStore } from '@/lib/session';
import type { AuthResponse, UserRole } from '@/lib/types';

export interface LoginInput {
  email: string;
  password: string;
}

export interface SignupInput extends LoginInput {
  name: string;
  role: UserRole | '';
}

/** Stores the session and sends the user to their role's dashboard. */
function useStartSession() {
  const router = useRouter();
  return (auth: AuthResponse) => {
    sessionStore.set(auth);
    router.replace(`/${auth.user.role}`);
  };
}

export function useLogin() {
  const startSession = useStartSession();
  return useMutation({
    mutationFn: (input: LoginInput) => apiRequest<AuthResponse>('/auth/login', { method: 'POST', body: input }),
    onSuccess: startSession,
  });
}

export function useSignup() {
  const startSession = useStartSession();
  return useMutation({
    mutationFn: (input: SignupInput) => apiRequest<AuthResponse>('/auth/signup', { method: 'POST', body: input }),
    onSuccess: startSession,
  });
}
