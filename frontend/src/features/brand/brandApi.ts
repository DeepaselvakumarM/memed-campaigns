'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/apiClient';
import { queryKeys } from '@/lib/queryKeys';
import type { Campaign, CreateCampaignPayload, Submission } from '@/lib/types';

export function useMyCampaigns() {
  return useQuery({
    queryKey: queryKeys.myCampaigns,
    queryFn: async () => (await apiRequest<{ campaigns: Campaign[] }>('/campaigns/mine')).campaigns,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateCampaignPayload) =>
      (await apiRequest<{ campaign: Campaign }>('/campaigns', { method: 'POST', body: payload })).campaign,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.myCampaigns }),
  });
}

export function useCampaignSubmissions(campaignId: string) {
  return useQuery({
    queryKey: queryKeys.campaignSubmissions(campaignId),
    queryFn: async () =>
      (await apiRequest<{ submissions: Submission[] }>(`/campaigns/${campaignId}/submissions`)).submissions,
  });
}
