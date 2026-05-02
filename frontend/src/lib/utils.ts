import { differenceInCalendarDays, format, parseISO, formatDistanceToNow } from 'date-fns';
import { JobStatus } from '../types';

// ── Date helpers ──────────────────────────────────────────────────
export function formatDate(dateStr: string): string {
  try { return format(parseISO(dateStr), 'MMM d, yyyy'); }
  catch { return dateStr; }
}

export function formatDateShort(dateStr: string): string {
  try { return format(parseISO(dateStr), 'MMM d'); }
  catch { return dateStr; }
}

export function formatDateTime(dateStr: string): string {
  try { return format(parseISO(dateStr), 'MMM d, yyyy · h:mm a'); }
  catch { return dateStr; }
}

export function timeAgo(dateStr: string): string {
  try { return formatDistanceToNow(parseISO(dateStr), { addSuffix: true }); }
  catch { return dateStr; }
}

export type FollowUpUrgency = 'overdue' | 'soon' | 'upcoming' | 'future';

export function getFollowUpUrgency(dateStr: string): FollowUpUrgency {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = differenceInCalendarDays(parseISO(dateStr), today);
  if (diff < 0) return 'overdue';
  if (diff <= 3) return 'soon';
  if (diff <= 7) return 'upcoming';
  return 'future';
}

export function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return differenceInCalendarDays(parseISO(dateStr), today);
}

// ── Status config ─────────────────────────────────────────────────
export interface StatusConfig {
  label: string;
  color: string;
  bg: string;
  border: string;
  dot: string;
  step: number; // for pipeline display
}

export const STATUS_CONFIG: Record<JobStatus, StatusConfig> = {
  saved: {
    label: 'Saved',
    color: 'text-slate-600',
    bg: 'bg-slate-100',
    border: 'border-slate-300',
    dot: 'bg-slate-400',
    step: 0,
  },
  applied: {
    label: 'Applied',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
    step: 1,
  },
  interview: {
    label: 'Interview',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    step: 2,
  },
  offer: {
    label: 'Offer',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    step: 3,
  },
  rejected: {
    label: 'Rejected',
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    dot: 'bg-red-400',
    step: 3,
  },
};

export const STATUS_ORDER: JobStatus[] = ['saved', 'applied', 'interview', 'offer', 'rejected'];

// ── Salary formatting ─────────────────────────────────────────────
export function formatSalary(min?: number, max?: number): string | null {
  if (!min && !max) return null;
  const fmt = (n: number) => {
    if (n >= 1000) return `$${Math.round(n / 1000)}k`;
    return `$${n}`;
  };
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  if (max) return `up to ${fmt(max)}`;
  return null;
}

// ── Company avatar helpers ─────────────────────────────────────────
export function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

const AVATAR_COLORS = [
  'bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-orange-500',
  'bg-rose-500', 'bg-indigo-500', 'bg-teal-500', 'bg-amber-600',
];

export function getCompanyColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
