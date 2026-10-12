'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { errorMessage } from '@/lib/apiClient';
import { Alert } from '@/ui/Alert';
import { Button } from '@/ui/Button';
import { TextField } from '@/ui/TextField';
import styles from './auth.module.css';
import { useSignup, type SignupInput } from './authApi';
import { RolePicker } from './RolePicker';

const EMPTY_FORM: SignupInput = { name: '', email: '', password: '', role: '' };

interface AccountFieldsProps {
  form: SignupInput;
  onUpdate: (patch: Partial<SignupInput>) => void;
}

function AccountFields({ form, onUpdate }: AccountFieldsProps) {
  return (
    <>
      <RolePicker value={form.role} onChange={(role) => onUpdate({ role })} />
      <TextField label="Name" autoComplete="name" value={form.name} onChange={(e) => onUpdate({ name: e.target.value })} />
      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={form.email}
        onChange={(e) => onUpdate({ email: e.target.value })}
      />
      <TextField
        label="Password"
        type="password"
        autoComplete="new-password"
        hint="8 to 72 characters"
        value={form.password}
        onChange={(e) => onUpdate({ password: e.target.value })}
      />
    </>
  );
}

export function SignupForm() {
  const [form, setForm] = useState<SignupInput>(EMPTY_FORM);
  const signup = useSignup();
  const update = (patch: Partial<SignupInput>) => setForm((current) => ({ ...current, ...patch }));

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    signup.mutate(form);
  }

  return (
    <>
      <h1 className={styles.title}>Create your account</h1>
      <p className={styles.subtitle}>Join as a brand to run campaigns, or as a creator to get paid for views.</p>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <AccountFields form={form} onUpdate={update} />
        {signup.isError && <Alert tone="error">{errorMessage(signup.error)}</Alert>}
        <Button type="submit" block isLoading={signup.isPending} loadingText="Creating account…">
          Create account
        </Button>
      </form>
      <p className={styles.switch}>
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </>
  );
}
