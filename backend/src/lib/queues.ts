import { Queue } from 'bullmq'
import { redis } from './redis'

export const resumeQueue = new Queue('resume-processing', { connection: redis })
export const matchQueue  = new Queue('ai-matching',        { connection: redis })