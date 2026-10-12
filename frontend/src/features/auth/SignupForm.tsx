'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { errorMessage } from '@/lib/apiClient';
import { Alert } from '@/ui/Alert';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { TextField } from '@/ui/TextField';
import styles from './auth.module.css';
import { useSignup, type SignupInput } from './authApi';
import { RolePicker } from './RolePicker';

const EMPTY_FORM: SignupInput = { name: '', email: '', password: '', role: '' };

export function SignupForm() {
  const [form, setForm] = useState<SignupInput>(EMPTY_FORM);
  const signup = useSignup();
  const update = (patch: Partial<SignupInput>) => setForm((current) => ({ ...current, ...patch }));

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    signup.mutate(form);
  }

  return (
    <Card className={styles.panel}>
      <div>
        <h1 className={styles.brandMark}>Create your account</h1>
        <p className={styles.subtitle}>Join Meme&apos;d as a brand or a creator.</p>
      </div>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <RolePicker value={form.role} onChange={(role) => update({ role })} />
        <TextField label="Name" autoComplete="name" value={form.name} onChange={(e) => update({ name: e.target.value })} />
        <TextField label="Email" type="email" autoComplete="email" value={form.email} onChange={(e) => update({ email: e.target.value })} />
        <TextField
          label="Password"
          type="password"
          autoComplete="new-password"
          hint="8 to 72 characters"
          value={form.password}
          onChange={(e) => update({ password: e.target.value })}
        />
        {signup.isError && <Alert tone="error">{errorMessage(signup.error)}</Alert>}
        <Button type="submit" isLoading={signup.isPending} loadingText="Creating account…">
          Sign up
        </Button>
      </form>
      <p className={styles.switch}>
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </Card>
  );
}
