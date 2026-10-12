'use client';

import { errorMessage } from '@/lib/apiClient';
import { formatRupees, PLATFORM_LABELS } from '@/lib/format';
import type { Campaign } from '@/lib/types';
import { Alert } from '@/ui/Alert';
import { Card } from '@/ui/Card';
import { Badge } from '@/ui/StatusBadge';
import { MilestoneLadder } from '../campaigns/MilestoneLadder';
import styles from './creator.module.css';
import { useLiveCampaigns } from './creatorApi';
import { SubmitPostForm } from './SubmitPostForm';

function LiveCampaignCard({ campaign }: { campaign: Campaign }) {
  return (
    <Card className={styles.campaign} aria-label={campaign.name}>
      <div className={styles.campaignHeader}>
        <div>
          <h3>{campaign.name}</h3>
          <p className={styles.campaignMeta}>
            by {campaign.brandName} · {formatRupees(campaign.remainingBudget)} budget left
          </p>
        </div>
        <Badge>{PLATFORM_LABELS[campaign.platform]}</Badge>
      </div>
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
    return <p className={styles.muted}>No live campaigns right now. Check back soon.</p>;
  }
  return (
    <div className={styles.grid}>
      {campaigns.data.map((campaign) => (
        <LiveCampaignCard key={campaign.id} campaign={campaign} />
      ))}
    </div>
  );
}
