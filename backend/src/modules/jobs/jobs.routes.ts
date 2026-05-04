import express from 'express';
import { z } from 'zod';

import { authMiddleware } from '../../middleware/auth.middleware';
import {
  createJob,
  deleteJobForUser,
  getJobForUser,
  getJobsForUser,
  updateJobForUser,
} from './jobs.service';

const jobStatusSchema = z.enum(['saved', 'applied', 'interview', 'offer', 'rejected']);

const createJobSchema = z.object({
  company: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1).optional().nullable(),
  status: jobStatusSchema.optional(),
  source: z.string().min(1).optional().nullable(),
});

const jobIdSchema = z.object({
  id: z.string().uuid(),
});

const updateJobSchema = z
  .object({
    company: z.string().min(1).optional(),
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    status: jobStatusSchema.optional(),
    source: z.string().min(1).nullable().optional(),
  })
  .strict();

function asyncHandler(
  fn: (req: express.Request, res: express.Response) => Promise<void>,
): express.RequestHandler {
  return (req, res, next) => {
    fn(req, res).catch(next);
  };
}

export const jobsRouter = express.Router();

jobsRouter.use(authMiddleware);

jobsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const parsed = createJobSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const job = await createJob({ userId, ...parsed.data });
    res.status(201).json(job);
  }),
);

jobsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const rows = await getJobsForUser(userId);
    res.json(rows);
  }),
);

jobsRouter.get(
  '/:id',
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

    const job = await getJobForUser(userId, params.data.id);
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }
    res.json(job);
  }),
);

jobsRouter.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const params = jobIdSchema.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const parsed = updateJobSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    if (Object.keys(parsed.data).length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const updated = await updateJobForUser(userId, params.data.id, parsed.data);
    if (!updated) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    res.json(updated);
  }),
);

jobsRouter.delete(
  '/:id',
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

    const ok = await deleteJobForUser(userId, params.data.id);
    if (!ok) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }
    res.status(204).send();
  }),
);

