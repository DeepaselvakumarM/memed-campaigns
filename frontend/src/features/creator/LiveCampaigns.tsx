'use client';

import { errorMessage } from '@/lib/apiClient';
import { formatRupees, percentSpent } from '@/lib/format';
import type { Campaign } from '@/lib/types';
import { Alert } from '@/ui/Alert';
import { Card } from '@/ui/Card';
import { EmptyState } from '@/ui/EmptyState';
import { MegaphoneIcon } from '@/ui/icons';
import { MilestoneLadder } from '../campaigns/MilestoneLadder';
import { PlatformBadge } from '../campaigns/PlatformBadge';
import styles from './creator.module.css';
import { useLiveCampaigns } from './creatorApi';
import { SubmitPostForm } from './SubmitPostForm';

function BudgetLeft({ campaign }: { campaign: Campaign }) {
  const percentLeft = 100 - percentSpent(campaign.spentBudget, campaign.totalBudget);
  return (
    <div className={styles.budgetLeft}>
      <div className={styles.budgetLeftRow}>
        <span>Budget left</span>
        <span>
          <strong>{formatRupees(campaign.remainingBudget)}</strong> of {formatRupees(campaign.totalBudget)}
        </span>
      </div>
      <div className={styles.miniTrack} aria-hidden="true">
        <div className={styles.miniFill} style={{ width: `${percentLeft}%` }} />
      </div>
    </div>
  );
}

function LiveCampaignCard({ campaign }: { campaign: Campaign }) {
  return (
    <Card className={styles.campaign} aria-label={campaign.name}>
      <div className={styles.campaignHeader}>
        <div>
          <h3 className={styles.campaignName}>{campaign.name}</h3>
          <p className={styles.brandName}>by {campaign.brandName}</p>
        </div>
        <PlatformBadge platform={campaign.platform} />
      </div>
      <BudgetLeft campaign={campaign} />
      <MilestoneLadder milestones={campaign.milestones} />
      <SubmitPostForm campaignId={campaign.id} platform={campaign.platform} />
    </Card>
  );
}

export function LiveCampaigns() {
  const campaigns = useLiveCampaigns();

  if (campaigns.isPending) return <p className={styles.muted}>Loading campaigns…</p>;
  if (campaigns.isError) return <Alert tone="error">{errorMessage(campaigns.error)}</Alert>;
  if (campaigns.data.length === 0) {
    return (
      <EmptyState icon={<MegaphoneIcon />} title="No live campaigns right now">
        New campaigns appear here as soon as brands launch them. Check back soon.
      </EmptyState>
    );
  }
  return (
    <div className={styles.grid}>
      {campaigns.data.map((campaign) => (
        <LiveCampaignCard key={campaign.id} campaign={campaign} />
      ))}
    </div>
  );
}
