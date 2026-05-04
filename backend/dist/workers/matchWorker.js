"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchWorker = void 0;
const bullmq_1 = require("bullmq");
const drizzle_orm_1 = require("drizzle-orm");
const redis_1 = require("../lib/redis");
const db_1 = require("../lib/db");
const schema_1 = require("../lib/schema");
const ai_service_1 = require("../modules/ai/ai.service");
const events_1 = require("../lib/events");
exports.matchWorker = new bullmq_1.Worker('ai-matching', async (job) => {
    const { jobId, userId } = job.data;
    // 1. Fetch job — single query (removed duplicate fetch)
    const jobRow = await db_1.db.query.jobs.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.jobs.id, jobId) });
    if (!jobRow?.description) {
        // Permanent failure — no point retrying, description won't appear on its own
        throw new bullmq_1.UnrecoverableError(`No description for job ${jobId}`);
    }
    // 2. Fetch latest resume for this user
    const resume = await db_1.db.query.resumes.findFirst({
        where: (0, drizzle_orm_1.eq)(schema_1.resumes.userId, userId),
        orderBy: (r, { desc }) => [desc(r.createdAt)],
    });
    if (!resume) {
        // Permanent failure — retrying won't create a resume
        throw new bullmq_1.UnrecoverableError(`No resume found for user ${userId}`);
    }
    // 3. Cosine similarity score via pgvector
    const score = await (0, ai_service_1.getMatchScore)(userId, jobId);
    // 4. LLM explanation via GPT-4o-mini
    const insight = await (0, ai_service_1.generateMatchInsight)(resume.rawText, jobRow.description, score);
    // 5. Persist to ai_insights
    await db_1.db.insert(schema_1.aiInsights).values({
        userId,
        jobId,
        type: 'match',
        result: insight,
    });
    // 6. Push SSE event to connected client
    await (0, events_1.publishEvent)({
        userId,
        event: 'match-complete',
        data: { jobId },
    });
    console.log(`[matchWorker] done job=${jobId} user=${userId} score=${score}`);
}, {
    connection: redis_1.redis,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
});
exports.matchWorker.on('ready', () => {
    console.log('[matchWorker] ready (listening on queue ai-matching)');
});
exports.matchWorker.on('active', (job) => {
    console.log(`[matchWorker] active job=${job.id} name=${job.name}`);
});
exports.matchWorker.on('failed', (job, err) => {
    console.error(`[matchWorker] failed job=${job?.id ?? 'unknown'} name=${job?.name ?? 'unknown'}: ${err?.message ?? err}`);
});
exports.matchWorker.on('error', (err) => {
    console.error('[matchWorker] error:', err);
});
