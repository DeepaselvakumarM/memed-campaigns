import type { Metadata } from 'next';
import { AuthLayout } from '@/features/auth/AuthLayout';
import { GuestOnly } from '@/features/auth/RoleGate';
import { SignupForm } from '@/features/auth/SignupForm';

export const metadata: Metadata = { title: "Sign up · Meme'd" };

export default function SignupPage() {
  return (
    <AuthLayout>
      <GuestOnly>
        <SignupForm />
      </GuestOnly>
    </AuthLayout>
  );
}
