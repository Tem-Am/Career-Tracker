import express from 'express';
import { z } from 'zod';

import { authMiddleware } from '../../middleware/auth.middleware';
// import { requireVerifiedEmail } from '../../middleware/verified.middleware';
import { checkAnalyzeLimit } from '../../middleware/rateLimit';
import { getInsightsForJob, queueMatchJob, analyzeJob } from './ai.service';

const jobIdSchema = z.object({
  jobId: z.string().uuid(),
});

const analyzeSchema = z.object({
  jobDescription: z.string().min(50, 'Job description must be at least 50 characters'),
});

function asyncHandler(
  fn: (req: express.Request, res: express.Response) => Promise<void>,
): express.RequestHandler {
  return (req, res, next) => {
    fn(req, res).catch(next);
  };
}

export const aiRouter = express.Router();
aiRouter.use(authMiddleware);

// ── existing routes ──────────────────────────────────────────────────────────

aiRouter.post(
  '/match/:jobId',
  checkAnalyzeLimit,
  asyncHandler(async (req, res) => {
    const params = jobIdSchema.safeParse(req.params);
    if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

    const result = await queueMatchJob({ userId, jobId: params.data.jobId });
    res.json(result);
  }),
);

aiRouter.get(
  '/insights/:jobId',
  asyncHandler(async (req, res) => {
    const params = jobIdSchema.safeParse(req.params);
    if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

    const result = await getInsightsForJob({ userId, jobId: params.data.jobId });
    res.json(result);
  }),
);

// ── new: analyze without saving a job ───────────────────────────────────────

// aiRouter.post(
//   '/analyze',
//   // requireVerifiedEmail,
//   // checkAnalyzeLimit,
//   asyncHandler(async (req, res) => {
//     const body = analyzeSchema.safeParse(req.body);
//     if (!body.success) { res.status(400).json({ error: body.error.flatten() }); return; }

//     const userId = req.user?.id;
//     if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

//     const result = await analyzeJob({ userId, jobDescription: body.data.jobDescription });

//     res.json({
//       ...result,
//       remaining: Number(res.getHeader('X-Analyze-Remaining') ?? 0),
//     });
//   }),
// );