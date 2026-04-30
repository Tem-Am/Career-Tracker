import './lib/env' 
import cors from 'cors'; 
import express from 'express'; 


import { authRouter } from './modules/auth/auth.routes';
import { jobsRouter } from './modules/jobs/jobs.routes';
import { resumeRouter } from './modules/resume/resume.routes';
import { aiRouter } from './modules/ai/ai.routes';

const app = express();

app.use(
  cors({
    origin: 'http://localhost:3000',
  }),
);
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter); // auth routes for user authentication and registration
app.use('/api/jobs', jobsRouter); // jobs routes for job listings and applications
app.use('/api/resume', resumeRouter); // resume routes for resume management and creation
app.use('/api/ai', aiRouter); // ai routes for ai-powered features and integrations

app.use((req, res) => {
  res.status(404).json({ error: `Not found: ${req.method} ${req.path}` });
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = err instanceof Error ? err.message : 'Internal server error';
  res.status(500).json({ error: message });
});

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
