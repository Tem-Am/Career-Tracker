// Matches db enum: job_status
export type JobStatus = 'saved' | 'applied' | 'interview' | 'offer' | 'rejected';

export interface User {
  id: string;
  email: string;
}

// Mirrors: backend jobs table
export interface Job {
  id: string;
  userId: string;
  company: string;
  title: string;
  description: string;
  status: JobStatus;
  source: string | null;
  createdAt: string;
}

export interface Resume {
  id: string;
  userId: string;
  rawText: string;
  createdAt: string;
}

export type AiInsight = {
  id: string;
  userId: string;
  jobId: string;
  type: string;
  result: unknown;
  createdAt: string;
};