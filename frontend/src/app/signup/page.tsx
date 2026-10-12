import type { Metadata } from 'next';
import styles from '@/features/auth/auth.module.css';
import { GuestOnly } from '@/features/auth/RoleGate';
import { SignupForm } from '@/features/auth/SignupForm';

export const metadata: Metadata = { title: "Sign up · Meme'd" };

export default function SignupPage() {
  return (
    <main className={styles.page}>
      <GuestOnly>
        <SignupForm />
      </GuestOnly>
    </main>
  );
}
