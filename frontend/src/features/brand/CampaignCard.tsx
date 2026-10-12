'use client';

import { useState } from 'react';
import { PLATFORM_LABELS } from '@/lib/format';
import type { Campaign } from '@/lib/types';
import { BudgetBar } from '@/ui/BudgetBar';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { StatusBadge } from '@/ui/StatusBadge';
import { MilestoneLadder } from '../campaigns/MilestoneLadder';
import styles from './brand.module.css';
import { CampaignSubmissions } from './CampaignSubmissions';

export function CampaignCard({ campaign }: { campaign: Campaign }) {
  const [showSubmissions, setShowSubmissions] = useState(false);
  const submissionCount = campaign.submissionCount ?? 0;

  return (
    <Card aria-label={campaign.name}>
      <div className={styles.campaignHeader}>
        <div>
          <h3>{campaign.name}</h3>
          <p className={styles.campaignMeta}>
            {PLATFORM_LABELS[campaign.platform]} · {submissionCount} {submissionCount === 1 ? 'post' : 'posts'}
          </p>
        </div>
        <StatusBadge isLive={campaign.isLive} />
      </div>
      <div className={styles.campaignBody}>
        <BudgetBar spent={campaign.spentBudget} total={campaign.totalBudget} />
        <MilestoneLadder milestones={campaign.milestones} />
        <div>
          <Button variant="secondary" aria-expanded={showSubmissions} onClick={() => setShowSubmissions((open) => !open)}>
            {showSubmissions ? 'Hide submissions' : 'View submissions'}
          </Button>
        </div>
        {showSubmissions && <CampaignSubmissions campaignId={campaign.id} />}
      </div>
    </Card>
  );
}
