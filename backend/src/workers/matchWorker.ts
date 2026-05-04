import { Worker, UnrecoverableError } from 'bullmq'
import { eq } from 'drizzle-orm'
import { redis } from '../lib/redis'
import { db } from '../lib/db'
import { resumes, jobs, aiInsights } from '../lib/schema'
import { getMatchScore, generateMatchInsight } from '../modules/ai/ai.service'
import { publishEvent } from '../lib/events'
 
export const matchWorker = new Worker(
  'ai-matching',
  async (job) => {
    const { jobId, userId } = job.data
 
    // 1. Fetch job — single query (removed duplicate fetch)
    const jobRow = await db.query.jobs.findFirst({ where: eq(jobs.id, jobId) })
    if (!jobRow?.description) {
      // Permanent failure — no point retrying, description won't appear on its own
      throw new UnrecoverableError(`No description for job ${jobId}`)
    }
 
    // 2. Fetch latest resume for this user
    const resume = await db.query.resumes.findFirst({
      where: eq(resumes.userId, userId),
      orderBy: (r, { desc }) => [desc(r.createdAt)],
    })
    if (!resume) {
      // Permanent failure — retrying won't create a resume
      throw new UnrecoverableError(`No resume found for user ${userId}`)
    }
 
    // 3. Cosine similarity score via pgvector
    const score = await getMatchScore(userId, jobId)
 
    // 4. LLM explanation via GPT-4o-mini
    const insight = await generateMatchInsight(resume.rawText, jobRow.description, score)
 
    // 5. Persist to ai_insights
    await db.insert(aiInsights).values({
      userId,
      jobId,
      type: 'match',
      result: insight,
    })
 
    // 6. Push SSE event to connected client
    await publishEvent({
      userId,
      event: 'match-complete',
      data: { jobId },
    })
 
    console.log(`[matchWorker] done job=${jobId} user=${userId} score=${score}`)
  },
  {
    connection: redis,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
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