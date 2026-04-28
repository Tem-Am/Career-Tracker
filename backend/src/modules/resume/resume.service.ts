import { desc, eq } from 'drizzle-orm';

import { db } from '../../lib/db';
import { resumes } from '../../lib/schema';

export async function saveResume(input: { userId: string; rawText: string }) {
  const inserted = await db
    .insert(resumes)
    .values({
      userId: input.userId,
      rawText: input.rawText,
    })
    .returning({ id: resumes.id });

  const row = inserted[0];
  if (!row) {
    throw new Error('Failed to save resume');
  }
  return row.id;
}

export async function getCurrentResume(userId: string) {
  const rows = await db
    .select()
    .from(resumes)
    .where(eq(resumes.userId, userId))
    .orderBy(desc(resumes.createdAt))
    .limit(1);
  return rows[0] ?? null;
}

