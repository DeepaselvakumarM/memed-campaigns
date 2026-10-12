'use client';

import { errorMessage } from '@/lib/apiClient';
import { Alert } from '@/ui/Alert';
import { Card } from '@/ui/Card';
import styles from './brand.module.css';
import { useMyCampaigns } from './brandApi';
import { CampaignCard } from './CampaignCard';
import { CreateCampaignForm } from './CreateCampaignForm';

function CampaignList() {
  const campaigns = useMyCampaigns();

  if (campaigns.isPending) return <p className={styles.muted}>Loading your campaigns…</p>;
  if (campaigns.isError) return <Alert tone="error">{errorMessage(campaigns.error)}</Alert>;
  if (campaigns.data.length === 0) {
    return (
      <Card>
        <p className={styles.muted}>No campaigns yet. Create your first one to start receiving posts.</p>
      </Card>
    );
  }
  return (
    <div className={styles.list}>
      {campaigns.data.map((campaign) => (
        <CampaignCard key={campaign.id} campaign={campaign} />
      ))}
    </div>
  );
}

export function BrandDashboard() {
  return (
    <main className={styles.layout}>
      <CreateCampaignForm />
      <section aria-labelledby="my-campaigns-title" className={styles.list}>
        <h2 id="my-campaigns-title" className={styles.sectionTitle}>
          Your campaigns
        </h2>
        <CampaignList />
      </section>
    </main>
  );
}
