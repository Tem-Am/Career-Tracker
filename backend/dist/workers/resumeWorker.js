"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resumeWorker = void 0;
const bullmq_1 = require("bullmq");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_orm_2 = require("drizzle-orm");
const redis_1 = require("../lib/redis");
const openai_1 = require("../lib/openai");
const db_1 = require("../lib/db");
const schema_1 = require("../lib/schema");
exports.resumeWorker = new bullmq_1.Worker('resume-processing', async (job) => {
    const { resumeId, rawText } = job.data;
    console.log(`[resumeWorker] Processing resume ${resumeId}...`);
    const embedding = await (0, openai_1.generateEmbedding)(rawText);
    await db_1.db
        .update(schema_1.resumes)
        .set({ embedding: (0, drizzle_orm_1.sql) `${JSON.stringify(embedding)}::vector` })
        .where((0, drizzle_orm_2.eq)(schema_1.resumes.id, resumeId));
    console.log(`[resumeWorker] Resume ${resumeId} done — embedding saved.`);
}, {
    connection: redis_1.redis,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
});
exports.resumeWorker.on('ready', () => {
    console.log('[resumeWorker] ready (listening on queue resume-processing)');
});
exports.resumeWorker.on('active', (job) => {
    console.log(`[resumeWorker] active job=${job.id} name=${job.name}`);
});
exports.resumeWorker.on('failed', (job, err) => {
    console.error(`[resumeWorker] failed job=${job?.id ?? 'unknown'} name=${job?.name ?? 'unknown'}: ${err?.message ?? err}`);
});
exports.resumeWorker.on('error', (err) => {
    console.error('[resumeWorker] error:', err);
});
