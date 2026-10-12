'use client';

import { useState, type FormEvent } from 'react';
import { errorMessage } from '@/lib/apiClient';
import { PLATFORM_LABELS } from '@/lib/format';
import type { Platform } from '@/lib/types';
import { Alert } from '@/ui/Alert';
import { Button } from '@/ui/Button';
import { TextField } from '@/ui/TextField';
import styles from './creator.module.css';
import { useSubmitPost } from './creatorApi';

const PLACEHOLDERS: Record<Platform, string> = {
  instagram: 'https://www.instagram.com/reel/…',
  youtube: 'https://www.youtube.com/watch?v=…',
};

interface SubmitPostFormProps {
  campaignId: string;
  platform: Platform;
}

export function SubmitPostForm({ campaignId, platform }: SubmitPostFormProps) {
  const [postUrl, setPostUrl] = useState('');
  const submitPost = useSubmitPost();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitPost.mutate({ campaignId, postUrl }, { onSuccess: () => setPostUrl('') });
  }

  return (
    <form className={styles.submitForm} onSubmit={handleSubmit} noValidate>
      <div className={styles.submitRow}>
        <TextField
          label={`${PLATFORM_LABELS[platform]} post link`}
          type="url"
          inputMode="url"
          placeholder={PLACEHOLDERS[platform]}
          value={postUrl}
          onChange={(e) => setPostUrl(e.target.value)}
        />
        <Button type="submit" isLoading={submitPost.isPending} loadingText="Submitting…">
          Submit
        </Button>
      </div>
      {submitPost.isError && <Alert tone="error">{errorMessage(submitPost.error)}</Alert>}
      {submitPost.isSuccess && <Alert tone="success">Post submitted. Track it under &ldquo;Your posts&rdquo;.</Alert>}
    </form>
  );
}
