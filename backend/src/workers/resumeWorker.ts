import { Worker } from 'bullmq'
import { sql } from 'drizzle-orm'
import { eq } from 'drizzle-orm'
import { redis } from '../lib/redis'
import { generateEmbedding } from '../lib/openai'
import { db } from '../lib/db'
import { resumes } from '../lib/schema'

export const resumeWorker = new Worker(
  'resume-processing',
  async (job) => {
    const { resumeId, rawText } = job.data

    console.log(`[resumeWorker] Processing resume ${resumeId}...`)

    const embedding = await generateEmbedding(rawText)

    await db
      .update(resumes)
      .set({ embedding: sql`${JSON.stringify(embedding)}::vector` })
      .where(eq(resumes.id, resumeId))

    console.log(`[resumeWorker] Resume ${resumeId} done — embedding saved.`)
  },
  {
    connection: redis,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
)

resumeWorker.on('ready', () => {
  console.log('[resumeWorker] ready (listening on queue resume-processing)')
})

resumeWorker.on('active', (job) => {
  console.log(`[resumeWorker] active job=${job.id} name=${job.name}`)
})

resumeWorker.on('failed', (job, err) => {
  console.error(
    `[resumeWorker] failed job=${job?.id ?? 'unknown'} name=${job?.name ?? 'unknown'}: ${err?.message ?? err}`,
  )
})

resumeWorker.on('error', (err) => {
  console.error('[resumeWorker] error:', err)
})