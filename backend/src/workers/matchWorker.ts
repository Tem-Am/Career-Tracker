import { Worker } from 'bullmq'
import { redis } from '../lib/redis'
import { db } from '../lib/db'
import { resumes, jobs, aiInsights } from '../lib/schema'
import { eq } from 'drizzle-orm'
import { getMatchScore, generateMatchInsight } from '../modules/ai/ai.service'

export const matchWorker = new Worker(
  'ai-matching',
  async (job) => {
  const { jobId, userId } = job.data

  // 1. Fetch the resume text
  const resume = await db.query.resumes.findFirst({
    where: eq(resumes.userId, userId),
    orderBy: (r, { desc }) => [desc(r.createdAt)],
  })
  if (!resume) throw new Error(`No resume for user ${userId}`)

  // 2. Fetch the job
  const jobRow = await db.query.jobs.findFirst({ where: eq(jobs.id, jobId) })
  if (!jobRow?.description) throw new Error(`No description for job ${jobId}`)

  // 3. Cosine similarity score
  const score = await getMatchScore(userId, jobId)

  // 4. LLM explanation
  const insight = await generateMatchInsight(resume.rawText, jobRow.description, score)

  // 5. Save to ai_insights
  await db.insert(aiInsights).values({
    userId,
    jobId,
    type: 'match',
    result: insight,
  })

  console.log(`Match job processed: job=${jobId}, user=${userId}`)
},
  { connection: redis },
)

matchWorker.on('ready', () => {
  console.log('[matchWorker] ready (listening on queue ai-matching)')
})

matchWorker.on('active', (job) => {
  console.log(`[matchWorker] active job=${job.id} name=${job.name}`)
})

matchWorker.on('failed', (job, err) => {
  console.error(
    `[matchWorker] failed job=${job?.id ?? 'unknown'} name=${job?.name ?? 'unknown'}: ${err?.message ?? err}`,
  )
})

matchWorker.on('error', (err) => {
  console.error('[matchWorker] error:', err)
})