'use client';

import { errorMessage } from '@/lib/apiClient';
import { formatNumber, formatRupees } from '@/lib/format';
import type { Submission } from '@/lib/types';
import { Alert } from '@/ui/Alert';
import { DataTable, PostLink } from '@/ui/DataTable';
import { SimulateViews } from '../campaigns/SimulateViews';
import styles from './brand.module.css';
import { useCampaignSubmissions } from './brandApi';

function SubmissionRow({ submission }: { submission: Submission }) {
  return (
    <tr>
      <td>{submission.creatorName}</td>
      <td>
        <PostLink url={submission.postUrl} />
      </td>
      <td>{formatNumber(submission.views)}</td>
      <td>
        {formatRupees(submission.paidAmount)}
        {submission.unpaidDueToBudget > 0 && (
          <div className={styles.muted}>{formatRupees(submission.unpaidDueToBudget)} unpaid (budget)</div>
        )}
      </td>
      <td>
        <SimulateViews submissionId={submission.id} currentViews={submission.views} />
      </td>
    </tr>
  );
}

export function CampaignSubmissions({ campaignId }: { campaignId: string }) {
  const submissions = useCampaignSubmissions(campaignId);

  if (submissions.isPending) return <p className={styles.muted}>Loading submissions…</p>;
  if (submissions.isError) return <Alert tone="error">{errorMessage(submissions.error)}</Alert>;
  if (submissions.data.length === 0) return <p className={styles.muted}>No posts submitted yet.</p>;

  return (
    <DataTable>
      <thead>
        <tr>
          <th scope="col">Creator</th>
          <th scope="col">Post</th>
          <th scope="col">Views</th>
          <th scope="col">Paid</th>
          <th scope="col">Simulate views (demo)</th>
        </tr>
      </thead>
      <tbody>
        {submissions.data.map((submission) => (
          <SubmissionRow key={submission.id} submission={submission} />
        ))}
      </tbody>
    </DataTable>
  );
}
