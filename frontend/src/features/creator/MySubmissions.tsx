import { formatNumber, formatRupees, formatViews } from '@/lib/format';
import type { Submission } from '@/lib/types';
import { Cell, DataTable, PostLink } from '@/ui/DataTable';
import { EmptyState } from '@/ui/EmptyState';
import { CheckIcon, FileIcon } from '@/ui/icons';
import { SimulateViews } from '../campaigns/SimulateViews';
import styles from './creator.module.css';

function NextTarget({ submission }: { submission: Submission }) {
  const next = submission.nextMilestone;
  if (!next) {
    return (
      <span className={styles.done}>
        <CheckIcon size={14} /> All reached
      </span>
    );
  }
  return (
    <span className={styles.nextTarget}>
      <span>{formatRupees(next.payout)}</span>
      <small>at {formatViews(next.viewThreshold)} views</small>
    </span>
  );
}

function SubmissionRow({ submission }: { submission: Submission }) {
  return (
    <tr>
      <Cell label="Campaign" className={styles.campaignCell}>
        {submission.campaignName}
      </Cell>
      <Cell label="Post">
        <PostLink url={submission.postUrl} />
      </Cell>
      <Cell label="Views">{formatNumber(submission.views)}</Cell>
      <Cell label="Earned">
        <span>
          <span className={styles.amount}>{formatRupees(submission.paidAmount)}</span>
          {submission.unpaidDueToBudget > 0 && (
            <span className={styles.unpaid}>{formatRupees(submission.unpaidDueToBudget)} unpaid (budget ran out)</span>
          )}
        </span>
      </Cell>
      <Cell label="Next milestone">
        <NextTarget submission={submission} />
      </Cell>
      <Cell label="Simulate views">
        <SimulateViews submissionId={submission.id} currentViews={submission.views} />
      </Cell>
    </tr>
  );
}

export function MySubmissions({ submissions }: { submissions: Submission[] }) {
  if (submissions.length === 0) {
    return (
      <EmptyState icon={<FileIcon />} title="No posts yet">
        Pick a live campaign above and submit your post link to start earning.
      </EmptyState>
    );
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
