import { and, desc, eq } from 'drizzle-orm';

import { db } from '../../lib/db';
import { jobs } from '../../lib/schema';

export type JobStatus = 'saved' | 'applied' | 'interview' | 'offer' | 'rejected';

export async function createJob(input: {
  userId: string;
  company: string;
  title: string;
  description?: string | null;
  status?: JobStatus;
  source?: string | null;
}) {
  const inserted = await db
    .insert(jobs)
    .values({
      userId: input.userId,
      company: input.company,
      title: input.title,
      description: input.description,
      status: input.status,
      source: input.source,
    })
    .returning();
  return inserted[0] ?? null;
}

export async function getJobsForUser(userId: string) {
  return db.select().from(jobs).where(eq(jobs.userId, userId)).orderBy(desc(jobs.createdAt));
}

export async function getJobForUser(userId: string, jobId: string) {
  const rows = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.id, jobId), eq(jobs.userId, userId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function updateJobForUser(
  userId: string,
  jobId: string,
  patch: Partial<{
    company: string;
    title: string;
    description: string;
    status: JobStatus;
    source: string | null;
  }>,
) {
  const updated = await db
    .update(jobs)
    .set(patch)
    .where(and(eq(jobs.id, jobId), eq(jobs.userId, userId)))
    .returning();
  return updated[0] ?? null;
}

export async function deleteJobForUser(userId: string, jobId: string) {
  const deleted = await db
    .delete(jobs)
    .where(and(eq(jobs.id, jobId), eq(jobs.userId, userId)))
    .returning({ id: jobs.id });
  return deleted.length > 0;
}

