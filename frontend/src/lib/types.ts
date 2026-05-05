export type JobStatus = 'saved' | 'applied' | 'interview' | 'offer' | 'rejected';

export interface Job {
  id: string;
  company: string;
  title: string;
  description: string;
  status: JobStatus;
  source?: string;
  visa?: string;
  createdAt: string;
}

export interface CreateJobInput {
  company: string;
  title: string;
  description: string;
  status: JobStatus;
  source?: string;
  visa?: string;
}

export interface AiInsight {
  id: string;
  jobId: string;
  type: 'match' | 'recommendation';
  result: {
    matchScore: number;
    missingSkills: string[];
    strongMatches: string[];
    recommendation: string;
  };
  createdAt: string;
}

export interface Resume {
  id: string;
  userId: string;
  rawText: string;
  createdAt: string;
}