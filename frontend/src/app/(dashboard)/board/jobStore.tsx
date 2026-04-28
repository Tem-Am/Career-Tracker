import { useState, useEffect } from 'react';
import { Job, Activity, Reminder, JobStatus, ActivityType } from "@/types";

const JOBS_KEY = 'jt-jobs-v2';
const ACTIVITIES_KEY = 'jt-activities-v2';
const REMINDERS_KEY = 'jt-reminders-v2';

// ── Sample seed data ──────────────────────────────────────────────
const DEMO_USER_ID = 'demo-user-1';

const seedJobs: Job[] = [
  {
    id: 'job-1',
    userId: DEMO_USER_ID,
    company: 'Stripe',
    role: 'Senior Frontend Engineer',
    status: 'interview',
    url: 'https://stripe.com/jobs',
    source: 'LinkedIn',
    appliedDate: '2026-03-01',
    followUpDate: '2026-04-22',
    resumeLabel: 'resume-stripe-v3.pdf',
    contactName: 'Sarah Kim',
    contactEmail: 'sarah.kim@stripe.com',
    notes: 'Great culture fit. They use React + TypeScript heavily. Focus on performance optimization in interview.',
    jobDescription: `We are looking for a Senior Frontend Engineer to join the Stripe Dashboard team. You will work on building the interfaces that millions of businesses use to manage their Stripe accounts.\n\nResponsibilities:\n• Build and maintain high-quality React components\n• Collaborate with design and backend teams\n• Improve performance and accessibility\n• Mentor junior engineers\n\nRequirements:\n• 5+ years of frontend experience\n• Expert knowledge of React, TypeScript\n• Experience with performance optimization`,
    salaryMin: 150000,
    salaryMax: 200000,
    isArchived: false,
    createdAt: '2026-03-01T09:00:00Z',
    updatedAt: '2026-03-10T14:00:00Z',
  },
  {
    id: 'job-2',
    userId: DEMO_USER_ID,
    company: 'Airbnb',
    role: 'Frontend Engineer',
    status: 'applied',
    url: 'https://careers.airbnb.com',
    source: 'Company Website',
    appliedDate: '2026-03-10',
    followUpDate: '2026-04-25',
    resumeLabel: 'resume-airbnb-v2.pdf',
    contactName: 'Mia Johnson',
    contactEmail: 'mia.j@airbnb.com',
    notes: 'Love their design culture. Remote-first. Follow up in 2 weeks if no response.',
    jobDescription: `Join Airbnb's web platform team to build experiences used by millions of travelers and hosts worldwide.\n\nRequirements:\n• 3+ years React experience\n• Strong TypeScript skills\n• Experience with testing (Jest, React Testing Library)\n• Passion for exceptional user experience`,
    salaryMin: 130000,
    salaryMax: 170000,
    isArchived: false,
    createdAt: '2026-03-10T16:00:00Z',
    updatedAt: '2026-03-10T16:00:00Z',
  },
  {
    id: 'job-3',
    userId: DEMO_USER_ID,
    company: 'Netflix',
    role: 'UI Engineer',
    status: 'offer',
    url: 'https://jobs.netflix.com',
    source: 'Referral',
    appliedDate: '2026-02-15',
    followUpDate: '2026-04-20',
    resumeLabel: 'resume-netflix-v1.pdf',
    contactName: 'David Park',
    contactEmail: 'dpark@netflix.com',
    notes: 'Offer received: $200k base + $400k RSU. Decision deadline April 20. Counter at $215k.',
    jobDescription: `Netflix is looking for a UI Engineer to work on our member-facing web experiences serving 260+ million members globally.\n\nResponsibilities:\n• Build performant, accessible UI components at massive scale\n• A/B test new features and analyze results\n\nRequirements:\n• 4+ years JavaScript/React\n• Experience with A/B testing\n• Performance optimization experience`,
    salaryMin: 180000,
    salaryMax: 250000,
    isArchived: false,
    createdAt: '2026-02-15T09:00:00Z',
    updatedAt: '2026-03-13T09:00:00Z',
  },
  {
    id: 'job-4',
    userId: DEMO_USER_ID,
    company: 'Google',
    role: 'Software Engineer L5',
    status: 'rejected',
    url: 'https://careers.google.com',
    source: 'LinkedIn',
    appliedDate: '2026-02-01',
    followUpDate: undefined,
    resumeLabel: 'resume-google-v2.pdf',
    contactName: undefined,
    contactEmail: undefined,
    notes: 'Failed the advanced DP coding round. Study interval DP and knapsack. Target 100 medium/hard DP problems before next attempt.',
    jobDescription: `Google is hiring L5 Software Engineers across multiple product areas.\n\nRequirements:\n• Strong CS fundamentals (algorithms, data structures)\n• Experience with large-scale distributed systems\n• Excellent problem-solving skills`,
    salaryMin: 200000,
    salaryMax: 300000,
    isArchived: false,
    createdAt: '2026-02-01T09:00:00Z',
    updatedAt: '2026-03-08T11:00:00Z',
  },
  {
    id: 'job-5',
    userId: DEMO_USER_ID,
    company: 'Figma',
    role: 'Staff Engineer',
    status: 'saved',
    url: 'https://figma.com/careers',
    source: 'Twitter/X',
    appliedDate: undefined,
    followUpDate: undefined,
    resumeLabel: undefined,
    contactName: undefined,
    contactEmail: undefined,
    notes: 'Interesting role. Need to tailor resume before applying. Research their editor architecture first.',
    jobDescription: `Figma is hiring a Staff Engineer to help build the future of design tools used by millions of designers worldwide.`,
    salaryMin: 220000,
    salaryMax: 320000,
    isArchived: false,
    createdAt: '2026-04-01T09:00:00Z',
    updatedAt: '2026-04-01T09:00:00Z',
  },
];

const seedActivities: Activity[] = [
  { id: 'act-1', jobId: 'job-1', userId: DEMO_USER_ID, type: 'created', note: 'Application added', createdAt: '2026-03-01T09:00:00Z' },
  { id: 'act-2', jobId: 'job-1', userId: DEMO_USER_ID, type: 'status_change', fromStatus: 'applied', toStatus: 'interview', note: 'Recruiter reached out for phone screen', createdAt: '2026-03-08T10:00:00Z' },
  { id: 'act-3', jobId: 'job-3', userId: DEMO_USER_ID, type: 'created', note: 'Application added', createdAt: '2026-02-15T09:00:00Z' },
  { id: 'act-4', jobId: 'job-3', userId: DEMO_USER_ID, type: 'status_change', fromStatus: 'applied', toStatus: 'interview', note: 'Technical screen scheduled', createdAt: '2026-02-22T11:00:00Z' },
  { id: 'act-5', jobId: 'job-3', userId: DEMO_USER_ID, type: 'status_change', fromStatus: 'interview', toStatus: 'offer', note: 'Offer received — $200k + RSUs', createdAt: '2026-03-12T10:00:00Z' },
  { id: 'act-6', jobId: 'job-4', userId: DEMO_USER_ID, type: 'created', note: 'Application added', createdAt: '2026-02-01T09:00:00Z' },
  { id: 'act-7', jobId: 'job-4', userId: DEMO_USER_ID, type: 'status_change', fromStatus: 'applied', toStatus: 'interview', note: 'Phone screen passed', createdAt: '2026-02-20T09:00:00Z' },
  { id: 'act-8', jobId: 'job-4', userId: DEMO_USER_ID, type: 'status_change', fromStatus: 'interview', toStatus: 'rejected', note: 'Did not pass coding bar (advanced DP)', createdAt: '2026-03-08T11:00:00Z' },
];

const seedReminders: Reminder[] = [
  { id: 'rem-1', jobId: 'job-1', userId: DEMO_USER_ID, remindAt: '2026-04-22T09:00:00Z', message: 'Follow up with Sarah on interview timeline', isSent: false, createdAt: '2026-03-10T09:00:00Z' },
  { id: 'rem-2', jobId: 'job-3', userId: DEMO_USER_ID, remindAt: '2026-04-20T09:00:00Z', message: 'Decision deadline — confirm final answer to David', isSent: false, createdAt: '2026-03-13T09:00:00Z' },
];

// ── Helpers ────────────────────────────────────────────────────────
function load<T>(key: string, seed: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : seed;
  } catch { return seed; }
}

function save<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ── Store ──────────────────────────────────────────────────────────
export function useJobStore(userId: string) {
  const [jobs, setJobs] = useState<Job[]>(() => load(JOBS_KEY, seedJobs));
  const [activities, setActivities] = useState<Activity[]>(() => load(ACTIVITIES_KEY, seedActivities));
  const [reminders, setReminders] = useState<Reminder[]>(() => load(REMINDERS_KEY, seedReminders));

  // Persist on change
  useEffect(() => { save(JOBS_KEY, jobs); }, [jobs]);
  useEffect(() => { save(ACTIVITIES_KEY, activities); }, [activities]);
  useEffect(() => { save(REMINDERS_KEY, reminders); }, [reminders]);

  // ── Filtered to current user ──
  const myJobs = jobs.filter(j => j.userId === userId);
  const myActivities = activities.filter(a => a.userId === userId);
  const myReminders = reminders.filter(r => r.userId === userId);

  // ── Private helper to push an activity ──
  const pushActivity = (
    jobId: string,
    type: ActivityType,
    opts: { fromStatus?: JobStatus; toStatus?: JobStatus; note?: string } = {}
  ) => {
    const act: Activity = {
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      jobId,
      userId,
      type,
      ...opts,
      createdAt: new Date().toISOString(),
    };
    setActivities(prev => {
      const next = [...prev, act];
      save(ACTIVITIES_KEY, next);
      return next;
    });
  };

  // ── Jobs CRUD ──────────────────────────────────────────────────
  const addJob = (data: Omit<Job, 'id' | 'userId' | 'isArchived' | 'createdAt' | 'updatedAt'>): Job => {
    const newJob: Job = {
      ...data,
      id: `job-${Date.now()}`,
      userId,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setJobs(prev => [newJob, ...prev]);
    pushActivity(newJob.id, 'created', { note: `Added ${data.company} — ${data.role}` });
    return newJob;
  };

  const updateJob = (id: string, updates: Partial<Omit<Job, 'id' | 'userId' | 'createdAt'>>) => {
    const existing = jobs.find(j => j.id === id);
    if (!existing) return;

    const next = { ...existing, ...updates, updatedAt: new Date().toISOString() };

    // Log status change as activity
    if (updates.status && updates.status !== existing.status) {
      pushActivity(id, 'status_change', {
        fromStatus: existing.status,
        toStatus: updates.status,
      });
    }

    setJobs(prev => prev.map(j => j.id === id ? next : j));
  };

  const deleteJob = (id: string) => {
    setJobs(prev => prev.filter(j => j.id !== id));
    setActivities(prev => prev.filter(a => a.jobId !== id));
    setReminders(prev => prev.filter(r => r.jobId !== id));
  };

  const archiveJob = (id: string, archive: boolean) => {
    updateJob(id, { isArchived: archive });
    pushActivity(id, 'updated', { note: archive ? 'Archived' : 'Unarchived' });
  };

  // ── Reminders CRUD ─────────────────────────────────────────────
  const addReminder = (jobId: string, remindAt: string, message?: string): Reminder => {
    const newReminder: Reminder = {
      id: `rem-${Date.now()}`,
      jobId,
      userId,
      remindAt,
      message,
      isSent: false,
      createdAt: new Date().toISOString(),
    };
    setReminders(prev => [...prev, newReminder]);
    pushActivity(jobId, 'reminder_set', { note: message || `Reminder set for ${remindAt}` });
    return newReminder;
  };

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  const markReminderSent = (id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, isSent: true } : r));
  };

  // ── Activities helpers ─────────────────────────────────────────
  const getJobActivities = (jobId: string): Activity[] =>
    myActivities
      .filter(a => a.jobId === jobId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getJobReminders = (jobId: string): Reminder[] =>
    myReminders
      .filter(r => r.jobId === jobId)
      .sort((a, b) => new Date(a.remindAt).getTime() - new Date(b.remindAt).getTime());

  return {
    jobs: myJobs,
    activities: myActivities,
    reminders: myReminders,
    addJob,
    updateJob,
    deleteJob,
    archiveJob,
    addReminder,
    deleteReminder,
    markReminderSent,
    getJobActivities,
    getJobReminders,
  };
}

export type JobStore = ReturnType<typeof useJobStore>;