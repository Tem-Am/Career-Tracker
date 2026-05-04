import { redis } from '../lib/redis'
import { Request, Response, NextFunction } from 'express'

const DAILY_LIMIT = 5

export async function checkAnalyzeLimit(req: Request, res: Response, next: NextFunction) {
  const userId = req.user!.id  // assumes JWT middleware already ran
  const today = new Date().toISOString().slice(0, 10)  // "2025-04-12"
  const key = `analyze:${userId}:${today}`

  const current = await redis.incr(key)
  if (current === 1) {
    // First use today — set TTL to expire at midnight UTC
    const now = new Date()
    const midnight = new Date(now)
    midnight.setUTCHours(24, 0, 0, 0)
    const ttl = Math.floor((midnight.getTime() - now.getTime()) / 1000)
    await redis.expire(key, ttl)
  }

  if (current > DAILY_LIMIT) {
    return res.status(429).json({
      error: 'Daily analyze limit reached',
      limit: DAILY_LIMIT,
      remaining: 0,
      resetsAt: 'midnight UTC',
    })
  }

  res.setHeader('X-Analyze-Remaining', DAILY_LIMIT - current)
  next()
}