import type { Metadata } from 'next';
import styles from '@/features/auth/auth.module.css';
import { LoginForm } from '@/features/auth/LoginForm';
import { GuestOnly } from '@/features/auth/RoleGate';

export const metadata: Metadata = { title: "Log in · Meme'd" };

export default function LoginPage() {
  return (
    <main className={styles.page}>
      <GuestOnly>
        <LoginForm />
      </GuestOnly>
    </main>
  );
}
