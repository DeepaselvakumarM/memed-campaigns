/** Every TanStack Query key in one place, so invalidation after a mutation can't drift from the queries. */
export const queryKeys = {
  /** Prefix matching every campaign query (mine, live, per-campaign submissions). */
  allCampaigns: ['campaigns'] as const,
  myCampaigns: ['campaigns', 'mine'] as const,
  liveCampaigns: ['campaigns', 'live'] as const,
  campaignSubmissions: (campaignId: string) => ['campaigns', campaignId, 'submissions'] as const,
  earnings: ['earnings'] as const,
};
