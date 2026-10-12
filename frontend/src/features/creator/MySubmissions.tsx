import { formatNumber, formatRupees, formatViews } from '@/lib/format';
import type { Submission } from '@/lib/types';
import { DataTable, PostLink } from '@/ui/DataTable';
import { SimulateViews } from '../campaigns/SimulateViews';
import styles from './creator.module.css';

function NextTarget({ submission }: { submission: Submission }) {
  const next = submission.nextMilestone;
  if (!next) return <span className={styles.muted}>All milestones reached</span>;
  return (
    <span>
      {formatViews(next.viewThreshold)} views → {formatRupees(next.payout)}
    </span>
  );
}

function SubmissionRow({ submission }: { submission: Submission }) {
  return (
    <tr>
      <td>{submission.campaignName}</td>
      <td>
        <PostLink url={submission.postUrl} />
      </td>
      <td>{formatNumber(submission.views)}</td>
      <td>
        <strong>{formatRupees(submission.paidAmount)}</strong>
        {submission.unpaidDueToBudget > 0 && (
          <div className={styles.muted}>{formatRupees(submission.unpaidDueToBudget)} unpaid (budget ran out)</div>
        )}
      </td>
      <td>
        <NextTarget submission={submission} />
      </td>
      <td>
        <SimulateViews submissionId={submission.id} currentViews={submission.views} />
      </td>
    </tr>
  );
}

export function MySubmissions({ submissions }: { submissions: Submission[] }) {
  if (submissions.length === 0) {
    return <p className={styles.muted}>You haven&apos;t submitted any posts yet. Pick a campaign above to get started.</p>;
  }
  return (
    <DataTable>
      <thead>
        <tr>
          <th scope="col">Campaign</th>
          <th scope="col">Post</th>
          <th scope="col">Views</th>
          <th scope="col">Earned</th>
          <th scope="col">Next milestone</th>
          <th scope="col">Simulate views (demo)</th>
        </tr>
      </thead>
      <tbody>
        {submissions.map((submission) => (
          <SubmissionRow key={submission.id} submission={submission} />
        ))}
      </tbody>
    </DataTable>
  );
}
