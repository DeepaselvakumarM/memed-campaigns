'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/apiClient';
import { queryKeys } from '@/lib/queryKeys';
import type { Campaign, Earnings, Submission } from '@/lib/types';

export function useLiveCampaigns() {
  return useQuery({
    queryKey: queryKeys.liveCampaigns,
    queryFn: async () => (await apiRequest<{ campaigns: Campaign[] }>('/campaigns')).campaigns,
  });
}

export function useEarnings() {
  return useQuery({
    queryKey: queryKeys.earnings,
    queryFn: () => apiRequest<Earnings>('/creators/me/earnings'),
  });
}

export function useSubmitPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { campaignId: string; postUrl: string }) =>
      (await apiRequest<{ submission: Submission }>('/submissions', { method: 'POST', body: input })).submission,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.earnings }),
  });
}
