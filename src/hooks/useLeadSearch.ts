"use client";

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { SearchJob, Lead, SearchFormData } from '@/types/leads';

interface SearchResult {
  results: Partial<Lead>[];
}

async function fetchLeads(data: SearchFormData): Promise<SearchResult> {
  const params = new URLSearchParams({
    term: data.niche,
    location: data.city,
    limit: '20',
  });

  const response = await fetch(`/api/yelp?${params}`);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to search for leads');
  }

  return response.json();
}

export function useLeadSearch() {
  const [currentJob, setCurrentJob] = useState<SearchJob | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: fetchLeads,
    onMutate: (data) => {
      // Create a new job when mutation starts
      const jobId = `job-${Date.now()}`;
      const newJob: SearchJob = {
        id: jobId,
        city: data.city,
        niche: data.niche,
        status: 'running',
        createdAt: new Date(),
      };
      setCurrentJob(newJob);
      setLeads([]);
      return { jobId };
    },
    onSuccess: (result, _data, context) => {
      // Map the results to our Lead format with jobId
      const mappedLeads: Lead[] = result.results.map((lead) => ({
        ...lead,
        jobId: context?.jobId || '',
      } as Lead));

      setLeads(mappedLeads);
      setCurrentJob((prev) => prev ? { ...prev, status: 'completed' } : null);

      // Cache the results
      if (context?.jobId) {
        queryClient.setQueryData(['leads', context.jobId], mappedLeads);
      }
    },
    onError: () => {
      setCurrentJob((prev) => prev ? { ...prev, status: 'completed' } : null);
    },
  });

  const startSearch = useCallback(async (data: SearchFormData) => {
    mutation.mutate(data);
  }, [mutation]);

  const resetSearch = useCallback(() => {
    setCurrentJob(null);
    setLeads([]);
    mutation.reset();
  }, [mutation]);

  return {
    currentJob,
    leads,
    isSubmitting: mutation.isPending,
    error: mutation.error?.message || null,
    startSearch,
    resetSearch,
  };
}
