// Matches db enum: job_status
export type JobStatus = 'saved' | 'applied' | 'interview' | 'offer' | 'rejected';

// Mirrors: users table
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Mirrors: jobs table
export interface Job {
  id: string;
  userId: string;
  company: string;
  role: string;
  status: JobStatus;
  url?: string;
  source?: string;
  appliedDate?: string;
  followUpDate?: string;
  resumeLabel?: string;
  contactName?: string;
  contactEmail?: string;
  notes?: string;
  jobDescription?: string;
  salaryMin?: number;
  salaryMax?: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

// Mirrors: activities table
export type ActivityType = 'created' | 'status_change' | 'note_added' | 'reminder_set' | 'updated';

export interface Activity {
  id: string;
  jobId: string;
  userId: string;
  type: ActivityType;
  fromStatus?: JobStatus;
  toStatus?: JobStatus;
  note?: string;
  createdAt: string;
}

// Mirrors: reminders table
export interface Reminder {
  id: string;
  jobId: string;
  userId: string;
  remindAt: string;   // ISO timestamptz
  message?: string;
  isSent: boolean;
  createdAt: string;
}