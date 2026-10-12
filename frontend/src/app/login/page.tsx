import type { Metadata } from 'next';
import { AuthLayout } from '@/features/auth/AuthLayout';
import { LoginForm } from '@/features/auth/LoginForm';
import { GuestOnly } from '@/features/auth/RoleGate';

export const metadata: Metadata = { title: "Log in · Meme'd" };

export default function LoginPage() {
  return (
    <AuthLayout>
      <GuestOnly>
        <LoginForm />
      </GuestOnly>
    </AuthLayout>
  );
}
