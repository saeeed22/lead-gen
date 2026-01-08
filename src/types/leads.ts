export type JobStatus = 'pending' | 'running' | 'completed';

export interface SearchJob {
  id: string;
  city: string;
  niche: string;
  status: JobStatus;
  createdAt: Date;
}

export interface Lead {
  id: string;
  jobId: string;
  name: string;
  website: string;
  email: string;
  phone: string;
  address: string;
}

export interface SearchFormData {
  city: string;
  niche: string;
}
