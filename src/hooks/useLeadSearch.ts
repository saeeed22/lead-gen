import { useState, useCallback } from 'react';
import type { SearchJob, Lead, SearchFormData, JobStatus } from '@/types/leads';

// Mock data generator for demo purposes
const generateMockLeads = (city: string, niche: string, jobId: string): Lead[] => {
  const businesses = [
    { prefix: 'Premium', suffix: 'Solutions' },
    { prefix: 'Elite', suffix: 'Services' },
    { prefix: 'Pro', suffix: 'Group' },
    { prefix: 'Metro', suffix: 'Co' },
    { prefix: 'City', suffix: 'Partners' },
    { prefix: 'Urban', suffix: 'Hub' },
    { prefix: 'Local', suffix: 'Experts' },
    { prefix: 'Prime', suffix: 'Network' },
  ];

  return businesses.map((biz, index) => ({
    id: `lead-${jobId}-${index}`,
    jobId,
    name: `${biz.prefix} ${niche} ${biz.suffix}`,
    website: `www.${biz.prefix.toLowerCase()}${niche.toLowerCase().replace(/\s/g, '')}.com`,
    email: `info@${biz.prefix.toLowerCase()}${niche.toLowerCase().replace(/\s/g, '')}.com`,
    phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
    address: `${Math.floor(Math.random() * 9000) + 1000} Main Street, ${city}`,
  }));
};

export function useLeadSearch() {
  const [currentJob, setCurrentJob] = useState<SearchJob | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startSearch = useCallback(async (data: SearchFormData) => {
    setIsSubmitting(true);
    setLeads([]);

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

    // Simulate job status transitions
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    setCurrentJob((prev) => prev ? { ...prev, status: 'running' } : null);
    
    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Generate mock leads
    const mockLeads = generateMockLeads(data.city, data.niche, jobId);
    setLeads(mockLeads);
    
    setCurrentJob((prev) => prev ? { ...prev, status: 'completed' } : null);
    setIsSubmitting(false);
  }, []);

  const resetSearch = useCallback(() => {
    setCurrentJob(null);
    setLeads([]);
  }, []);

  return {
    currentJob,
    leads,
    isSubmitting,
    startSearch,
    resetSearch,
  };
}
