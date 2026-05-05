import './lib/env' 
import cors from 'cors'; 
import express from 'express'; 
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

import { authRouter } from './modules/auth/auth.routes';
import { jobsRouter } from './modules/jobs/jobs.routes';
import { resumeRouter } from './modules/resume/resume.routes';
import { aiRouter } from './modules/ai/ai.routes';
import { addSseClient, getUserIdFromToken, removeSseClient } from './lib/events';

const app = express();

app.use(helmet())

// ── CORS — env-driven, not hardcoded ────────────────────────────────────────
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim())

app.use(
  cors({
    origin: (origin, cb) => {
      // allow server-to-server / curl with no origin header
      if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true)
      cb(null, false)
    },
    credentials: true,
  }),
)

// ── Body parsing with size limits ───────────────────────────────────────────
// Stops someone POSTing a 50MB JSON blob to burn your CPU
app.use(express.json({ limit: '64kb' }))
app.use(express.urlencoded({ extended: true, limit: '64kb' }))

// ── Global rate limit — catch-all safety net ────────────────────────────────
// Every IP is limited to 200 req / 15 min across the whole API
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,  // returns RateLimit-* headers
    legacyHeaders: false,
    message: { error: 'Too many requests, slow down.' },
  }),
)


// ── Auth route limiter — slow down brute force ──────────────────────────────
// 10 attempts per IP per 15 min on login/register
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 10 : 100, // relaxed in dev
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth attempts, try again later.' },
})

// ── Resume route limiter — each upload triggers an OpenAI embedding call ───
// 10 uploads per IP per hour
const resumeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Resume upload limit reached, try again later.' },
})

const aiLimiter = rateLimit({ windowMs: 60 * 1000, max: 5 })

// Health 
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/events', (req, res) => {
  const token = typeof req.query.token === 'string' ? req.query.token : ''
  const userId = token ? getUserIdFromToken(token) : null
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  res.status(200)
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  addSseClient({ res, userId })
  res.write(`event: ready\ndata: ${JSON.stringify({ ok: true })}\n\n`)

  const heartbeat = setInterval(() => {
    res.write(`event: ping\ndata: ${JSON.stringify({ t: Date.now() })}\n\n`)
  }, 25_000)

  req.on('close', () => {
    clearInterval(heartbeat)
    removeSseClient(userId, res)
  })
})

app.use('/api/auth',authLimiter, authRouter); // auth routes for user authentication and registration
app.use('/api/jobs', jobsRouter); // jobs routes for job listings and applications
app.use('/api/resume', resumeLimiter, resumeRouter); // resume routes for resume management and creation
app.use('/api/ai', aiLimiter, aiRouter); // ai routes for ai-powered features and integrations

app.use((req, res) => {
  res.status(404).json({ error: `Not found: ${req.method} ${req.path}` });
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // Log the real error server-side for debugging
  console.error('[error]', err)

  // Only expose the message in development — never in production
  const isDev = process.env.NODE_ENV !== 'production'
  const message = isDev && err instanceof Error ? err.message : 'Internal server error'

  res.status(500).json({ error: message })
})

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on port ${port}`);
});
