import { Worker } from 'bullmq'
import { redis } from '../lib/redis'
import { generateEmbedding } from '../lib/openai'
import { db } from '../lib/db'
import { resumes } from '../lib/schema'
import { eq } from 'drizzle-orm'

new Worker('resume-processing', async (job) => {
  const { resumeId, rawText } = job.data

  console.log(`Processing resume ${resumeId}...`)
  const embedding = await generateEmbedding(rawText)

  await db.update(resumes)
    .set({ embedding:  JSON.stringify(embedding) as any })
    .where(eq(resumes.id, resumeId))

  console.log(`Resume ${resumeId} done! Embedding is saved.`)
}, { connection: redis })