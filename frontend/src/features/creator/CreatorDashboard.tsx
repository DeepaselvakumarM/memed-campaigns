'use client';

import { errorMessage } from '@/lib/apiClient';
import { Alert } from '@/ui/Alert';
import styles from './creator.module.css';
import { useEarnings } from './creatorApi';
import { EarningsSummary } from './EarningsSummary';
import { LiveCampaigns } from './LiveCampaigns';
import { MySubmissions } from './MySubmissions';

function EarningsSection() {
  const earnings = useEarnings();

  if (earnings.isPending) return <p className={styles.muted}>Loading your earnings…</p>;
  if (earnings.isError) return <Alert tone="error">{errorMessage(earnings.error)}</Alert>;
  return (
    <>
      <EarningsSummary earnings={earnings.data} />
      <section className={styles.section} aria-labelledby="my-posts-title">
        <h2 id="my-posts-title" className={styles.sectionTitle}>
          Your posts
        </h2>
        <MySubmissions submissions={earnings.data.submissions} />
      </section>
    </>
  );
}

export function CreatorDashboard() {
  return (
    <main className={styles.layout}>
      <section className={styles.section} aria-labelledby="earnings-title">
        <h2 id="earnings-title" className={styles.sectionTitle}>
          Your earnings
        </h2>
        <EarningsSection />
      </section>
      <section className={styles.section} aria-labelledby="live-campaigns-title">
        <h2 id="live-campaigns-title" className={styles.sectionTitle}>
          Live campaigns
        </h2>
        <LiveCampaigns />
      </section>
    </main>
  );
}
