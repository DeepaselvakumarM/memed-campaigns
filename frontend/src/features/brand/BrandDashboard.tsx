'use client';

import { errorMessage } from '@/lib/apiClient';
import type { Campaign } from '@/lib/types';
import { Alert } from '@/ui/Alert';
import { EmptyState } from '@/ui/EmptyState';
import { MegaphoneIcon } from '@/ui/icons';
import { Page } from '@/ui/Page';
import { PageHeader, SectionHeading } from '@/ui/PageHeader';
import { useSession } from '../auth/useSession';
import styles from './brand.module.css';
import { BrandStats } from './BrandStats';
import { useMyCampaigns } from './brandApi';
import { CampaignCard } from './CampaignCard';
import { CreateCampaignForm } from './CreateCampaignForm';

function CampaignList({ campaigns }: { campaigns: readonly Campaign[] }) {
  if (campaigns.length === 0) {
    return (
      <EmptyState icon={<MegaphoneIcon />} title="No campaigns yet">
        Create your first campaign and creators can start posting for it right away.
      </EmptyState>
    );
  }
  return (
    <>
      {campaigns.map((campaign) => (
        <CampaignCard key={campaign.id} campaign={campaign} />
      ))}
    </>
  );
}

export function BrandDashboard() {
  const firstName = useSession()?.user.name.split(' ')[0] ?? '';
  const campaigns = useMyCampaigns();

  return (
    <Page>
      <PageHeader
        eyebrow="Brand dashboard"
        title={`Welcome back, ${firstName}`}
        subtitle="Launch campaigns and keep an eye on every rupee of your budget."
      />
      {campaigns.isSuccess && <BrandStats campaigns={campaigns.data} />}
      <div className={styles.columns}>
        <div className={styles.formColumn}>
          <CreateCampaignForm />
        </div>
        <section aria-labelledby="my-campaigns-title" className={styles.list}>
          <SectionHeading id="my-campaigns-title" title="Your campaigns" count={campaigns.data?.length} />
          {campaigns.isPending && <p className={styles.muted}>Loading your campaigns…</p>}
          {campaigns.isError && <Alert tone="error">{errorMessage(campaigns.error)}</Alert>}
          {campaigns.isSuccess && <CampaignList campaigns={campaigns.data} />}
        </section>
      </div>
    </Page>
  );
}
