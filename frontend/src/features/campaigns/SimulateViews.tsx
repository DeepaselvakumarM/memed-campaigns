'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { apiRequest, errorMessage } from '@/lib/apiClient';
import { formatRupees } from '@/lib/format';
import { queryKeys } from '@/lib/queryKeys';
import type { ViewUpdateResult } from '@/lib/types';
import { Button } from '@/ui/Button';
import styles from './campaigns.module.css';

function useUpdateViews(submissionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (views: number) =>
      apiRequest<ViewUpdateResult>(`/submissions/${submissionId}/views`, { method: 'PATCH', body: { views } }),
    // Payouts change campaign budgets and earnings, so refresh everything campaign-related.
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.allCampaigns }),
        queryClient.invalidateQueries({ queryKey: queryKeys.earnings }),
      ]),
  });
}

function resultMessage(result: ViewUpdateResult): { text: string; tone: 'simulateSuccess' | 'simulateWarning' } {
  if (result.cappedByBudget) {
    return {
      text: `Paid ${formatRupees(result.paidNow)} — capped because the campaign budget ran out.`,
      tone: 'simulateWarning',
    };
  }
  return {
    text: result.paidNow > 0 ? `Milestone reached! Paid ${formatRupees(result.paidNow)}.` : 'Views updated. No new payout.',
    tone: 'simulateSuccess',
  };
}

interface SimulateViewsProps {
  submissionId: string;
  currentViews: number;
}

/** Demo control for PATCH /api/submissions/:id/views, standing in for real platform view data. */
export function SimulateViews({ submissionId, currentViews }: SimulateViewsProps) {
  const [views, setViews] = useState(String(currentViews));
  const updateViews = useUpdateViews(submissionId);
  const message = updateViews.data ? resultMessage(updateViews.data) : null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateViews.mutate(Number(views));
  }

  return (
    <form className={styles.simulate} onSubmit={handleSubmit}>
      <div className={styles.simulateRow}>
        <label htmlFor={`views-${submissionId}`} className="visually-hidden">
          New view count
        </label>
        <input
          id={`views-${submissionId}`}
          type="number"
          min={0}
          step={1}
          inputMode="numeric"
          value={views}
          onChange={(event) => setViews(event.target.value)}
        />
        <Button type="submit" variant="secondary" isLoading={updateViews.isPending} loadingText="Saving…">
          Set views
        </Button>
      </div>
      {updateViews.isError && (
        <span role="alert" className={`${styles.simulateMessage} ${styles.simulateError}`}>
          {errorMessage(updateViews.error)}
        </span>
      )}
      {message && (
        <span role="status" className={`${styles.simulateMessage} ${styles[message.tone]}`}>
          {message.text}
        </span>
      )}
    </form>
  );
}
