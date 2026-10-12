'use client';

import { useState } from 'react';
import type { Campaign } from '@/lib/types';
import { BudgetBar } from '@/ui/BudgetBar';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { ChevronIcon } from '@/ui/icons';
import { StatusBadge } from '@/ui/StatusBadge';
import { MilestoneLadder } from '../campaigns/MilestoneLadder';
import { PlatformBadge } from '../campaigns/PlatformBadge';
import styles from './brand.module.css';
import { CampaignSubmissions } from './CampaignSubmissions';

const dateFormatter = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

function CampaignHeader({ campaign }: { campaign: Campaign }) {
  const submissionCount = campaign.submissionCount ?? 0;
  return (
    <div className={styles.campaignHeader}>
      <div>
        <h3 className={styles.campaignName}>{campaign.name}</h3>
        <div className={styles.campaignMeta}>
          <PlatformBadge platform={campaign.platform} />
          <span>
            {submissionCount} {submissionCount === 1 ? 'post' : 'posts'}
          </span>
          <span className={styles.metaDivider} aria-hidden="true" />
          <span>Created {dateFormatter.format(new Date(campaign.createdAt))}</span>
        </div>
      </div>
      <StatusBadge isLive={campaign.isLive} />
    </div>
  );
}

export function CampaignCard({ campaign }: { campaign: Campaign }) {
  const [showSubmissions, setShowSubmissions] = useState(false);

  return (
    <Card className={styles.campaign} aria-label={campaign.name}>
      <CampaignHeader campaign={campaign} />
      <BudgetBar spent={campaign.spentBudget} total={campaign.totalBudget} />
      <div className={styles.campaignFooter}>
        <MilestoneLadder milestones={campaign.milestones} />
        <Button variant="ghost" aria-expanded={showSubmissions} onClick={() => setShowSubmissions((open) => !open)}>
          {showSubmissions ? 'Hide submissions' : 'View submissions'}
          <ChevronIcon size={16} className={`${styles.chevron} ${showSubmissions ? styles.chevronOpen : ''}`} />
        </Button>
      </div>
      {showSubmissions && <CampaignSubmissions campaignId={campaign.id} />}
    </Card>
  );
}
