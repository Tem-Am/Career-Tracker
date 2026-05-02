"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./lib/env");
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const auth_routes_1 = require("./modules/auth/auth.routes");
const jobs_routes_1 = require("./modules/jobs/jobs.routes");
const resume_routes_1 = require("./modules/resume/resume.routes");
const ai_routes_1 = require("./modules/ai/ai.routes");
const events_1 = require("./lib/events");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000',
}));
app.use(express_1.default.json());
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.get('/events', (req, res) => {
    const token = typeof req.query.token === 'string' ? req.query.token : '';
    const userId = token ? (0, events_1.getUserIdFromToken)(token) : null;
    if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    res.status(200);
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    (0, events_1.addSseClient)({ res, userId });
    // Initial hello (helps client detect connection)
    res.write(`event: ready\ndata: ${JSON.stringify({ ok: true })}\n\n`);
    const heartbeat = setInterval(() => {
        res.write(`event: ping\ndata: ${JSON.stringify({ t: Date.now() })}\n\n`);
    }, 25000);
    req.on('close', () => {
        clearInterval(heartbeat);
        (0, events_1.removeSseClient)(userId, res);
    });
});
app.use('/api/auth', auth_routes_1.authRouter); // auth routes for user authentication and registration
app.use('/api/jobs', jobs_routes_1.jobsRouter); // jobs routes for job listings and applications
app.use('/api/resume', resume_routes_1.resumeRouter); // resume routes for resume management and creation
app.use('/api/ai', ai_routes_1.aiRouter); // ai routes for ai-powered features and integrations
app.use((req, res) => {
    res.status(404).json({ error: `Not found: ${req.method} ${req.path}` });
});
app.use((err, _req, res, _next) => {
    const message = err instanceof Error ? err.message : 'Internal server error';
    res.status(500).json({ error: message });
});
const port = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
