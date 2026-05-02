"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const redis_1 = require("../lib/redis");
const openai_1 = require("../lib/openai");
const db_1 = require("../lib/db");
const schema_1 = require("../lib/schema");
const drizzle_orm_1 = require("drizzle-orm");
new bullmq_1.Worker('resume-processing', async (job) => {
    const { resumeId, rawText } = job.data;
    console.log(`Processing resume ${resumeId}...`);
    const embedding = await (0, openai_1.generateEmbedding)(rawText);
    await db_1.db.update(schema_1.resumes)
        .set({ embedding: JSON.stringify(embedding) })
        .where((0, drizzle_orm_1.eq)(schema_1.resumes.id, resumeId));
    console.log(`Resume ${resumeId} done! Embedding is saved.`);
}, { connection: redis_1.redis });
