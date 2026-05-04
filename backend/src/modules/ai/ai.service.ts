import { db } from '../../lib/db';
import { jobs, resumes, aiInsights } from '../../lib/schema';
import { eq, sql } from 'drizzle-orm';
import { generateEmbedding, openai } from '../../lib/openai';
import { matchQueue } from '../../lib/queues';

// --- queueMatchJob (was a stub) ---
export async function queueMatchJob(input: { userId: string; jobId: string }) {
  await matchQueue.add('match-job', {
    jobId: input.jobId,
    userId: input.userId,
  });
  return { status: 'queued' as const };
}

// --- getInsightsForJob (was a stub) ---
export async function getInsightsForJob(input: { userId: string; jobId: string }) {
  const rows = await db.query.aiInsights.findMany({
    where: eq(aiInsights.jobId, input.jobId),
    orderBy: (i, { desc }) => [desc(i.createdAt)],
  });
  return rows;
}

// --- match logic (called by the worker) ---
export async function getMatchScore(userId: string, jobId: string): Promise<number> {
  const job = await db.query.jobs.findFirst({ where: eq(jobs.id, jobId) });
  if (!job?.description) throw new Error('Job has no description');

  const jobEmbedding = await generateEmbedding(job.description);

  const result = await db.execute(sql`
    SELECT 1 - (embedding <=> ${JSON.stringify(jobEmbedding)}::vector) AS score
    FROM resumes
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT 1
  `);

  return (result.rows[0]?.score as number) ?? 0;
}

export async function generateMatchInsight(
  resumeText: string,
  jobDescription: string,
  score: number,
) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'user',
        content: `
          Compare this resume and job description.
          Match score: ${Math.round(score * 100)}%

          Resume: ${resumeText.slice(0, 3000)}
          Job: ${jobDescription.slice(0, 3000)}

          Return JSON with exactly these keys:
          {
            "matchScore": number,
            "missingSkills": string[],
            "strongMatches": string[],
            "recommendation": string
          }
        `,
      },
    ],
  });

  return JSON.parse(response.choices[0].message.content!);
}

export async function analyzeJob(input: { userId: string; jobDescription: string }) {
  const resume = await db.query.resumes.findFirst({
    where: eq(resumes.userId, input.userId),
    orderBy: (r, { desc }) => [desc(r.createdAt)],
  });

  if (!resume?.embedding) {
    throw new Error('No processed resume found. Upload your resume first.');
  }

  const jobEmbedding = await generateEmbedding(input.jobDescription);

  const result = await db.execute(sql`
    SELECT 1 - (embedding <=> ${JSON.stringify(jobEmbedding)}::vector) AS score
    FROM resumes
    WHERE user_id = ${input.userId}
    ORDER BY created_at DESC
    LIMIT 1
  `);

  const score = (result.rows[0]?.score as number) ?? 0;

  const insight = await generateMatchInsight(resume.rawText, input.jobDescription, score);

  return insight; // { matchScore, missingSkills, strongMatches, recommendation }
}