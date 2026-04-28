import express from 'express';
import { z } from 'zod';

import { authMiddleware } from '../../middleware/auth.middleware';
import { getInsightsForJob, queueMatchJob } from './ai.service';

const jobIdSchema = z.object({
  jobId: z.string().uuid(),
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

aiRouter.post(
  '/match/:jobId',
  asyncHandler(async (req, res) => {
    const params = jobIdSchema.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const result = await queueMatchJob({ userId, jobId: params.data.jobId });
    res.json(result);
  }),
);

aiRouter.get(
  '/insights/:jobId',
  asyncHandler(async (req, res) => {
    const params = jobIdSchema.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const result = await getInsightsForJob({ userId, jobId: params.data.jobId });
    res.json(result);
  }),
);

