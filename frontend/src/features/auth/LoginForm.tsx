'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { errorMessage } from '@/lib/apiClient';
import { Alert } from '@/ui/Alert';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { TextField } from '@/ui/TextField';
import styles from './auth.module.css';
import { useLogin } from './authApi';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useLogin();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    login.mutate({ email, password });
  }

  return (
    <Card className={styles.panel}>
      <div>
        <h1 className={styles.brandMark}>Meme&apos;d</h1>
        <p className={styles.subtitle}>Log in to manage campaigns or track your earnings.</p>
      </div>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <TextField label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {login.isError && <Alert tone="error">{errorMessage(login.error)}</Alert>}
        <Button type="submit" isLoading={login.isPending} loadingText="Logging in…">
          Log in
        </Button>
      </form>
      <p className={styles.switch}>
        New here? <Link href="/signup">Create an account</Link>
      </p>
    </Card>
  );
}
