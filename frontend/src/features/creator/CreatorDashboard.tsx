'use client';

import { errorMessage } from '@/lib/apiClient';
import { Alert } from '@/ui/Alert';
import { Page } from '@/ui/Page';
import { PageHeader, SectionHeading } from '@/ui/PageHeader';
import { useSession } from '../auth/useSession';
import styles from './creator.module.css';
import { useEarnings } from './creatorApi';
import { EarningsSummary } from './EarningsSummary';
import { LiveCampaigns } from './LiveCampaigns';
import { MySubmissions } from './MySubmissions';

export function CreatorDashboard() {
  const firstName = useSession()?.user.name.split(' ')[0] ?? '';
  const earnings = useEarnings();

  return (
    <Page>
      <PageHeader
        eyebrow="Creator dashboard"
        title={`Welcome back, ${firstName}`}
        subtitle="Submit posts to live campaigns and get paid as your views climb."
      />
      {earnings.isError && <Alert tone="error">{errorMessage(earnings.error)}</Alert>}
      {earnings.isSuccess && <EarningsSummary earnings={earnings.data} />}

      <section className={styles.section} aria-labelledby="live-campaigns-title">
        <SectionHeading id="live-campaigns-title" title="Live campaigns" />
        <LiveCampaigns />
      </section>

      <section className={styles.section} aria-labelledby="my-posts-title">
        <SectionHeading id="my-posts-title" title="Your posts" count={earnings.data?.submissionCount} />
        {earnings.isPending && <p className={styles.muted}>Loading your posts…</p>}
        {earnings.isSuccess && <MySubmissions submissions={earnings.data.submissions} />}
      </section>
    </Page>
  );
}
