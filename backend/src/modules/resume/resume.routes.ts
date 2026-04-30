import express from 'express';
import { z } from 'zod';

import { authMiddleware } from '../../middleware/auth.middleware';
import { getCurrentResume, saveResume } from './resume.service';
import { resumeQueue } from '../../lib/queues'

const saveResumeSchema = z.object({
  rawText: z.string().min(1),
});

function asyncHandler(
  fn: (req: express.Request, res: express.Response) => Promise<void>,
): express.RequestHandler {
  return (req, res, next) => {
    fn(req, res).catch(next);
  };
}

export const resumeRouter = express.Router();

resumeRouter.use(authMiddleware);

resumeRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const parsed = saveResumeSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const id = await saveResume({ userId, rawText: parsed.data.rawText });
    
    await resumeQueue.add('parse-resume', {
      resumeId: id,
      rawText: parsed.data.rawText,
    });

    
    res.status(201).json({ id });
  }),
);

resumeRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const resume = await getCurrentResume(userId);
    if (!resume) {
      res.status(404).json({ error: 'Resume not found' });
      return;
    }

    res.json(resume);
  }),
);

