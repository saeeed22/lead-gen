"use client";

import { useState, useCallback } from 'react';
import type { SearchJob, Lead, SearchFormData } from '@/types/leads';

export function useLeadSearch() {
  const [currentJob, setCurrentJob] = useState<SearchJob | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startSearch = useCallback(async (data: SearchFormData) => {
    setIsSubmitting(true);
    setLeads([]);
    setError(null);

    // Create a new job
    const jobId = `job-${Date.now()}`;
    const newJob: SearchJob = {
      id: jobId,
      city: data.city,
      niche: data.niche,
      status: 'pending',
      createdAt: new Date(),
    };
    setCurrentJob(newJob);

    // Update to running status
    setCurrentJob((prev) => prev ? { ...prev, status: 'running' } : null);

    try {
      // Call our API route which proxies to Foursquare
      const params = new URLSearchParams({
        query: data.niche,
        near: data.city,
        limit: '20',
      });

      const response = await fetch(`/api/search?${params}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to search for leads');
      }

      const result = await response.json();

      // Map the results to our Lead format with jobId
      const mappedLeads: Lead[] = result.results.map((lead: Partial<Lead>) => ({
        ...lead,
        jobId,
      } as Lead));

      setLeads(mappedLeads);
      setCurrentJob((prev) => prev ? { ...prev, status: 'completed' } : null);
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setCurrentJob((prev) => prev ? { ...prev, status: 'completed' } : null);
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const resetSearch = useCallback(() => {
    setCurrentJob(null);
    setLeads([]);
    setError(null);
  }, []);

  return {
    currentJob,
    leads,
    isSubmitting,
    error,
    startSearch,
    resetSearch,
  };
}
