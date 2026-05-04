"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queueMatchJob = queueMatchJob;
exports.getInsightsForJob = getInsightsForJob;
exports.getMatchScore = getMatchScore;
exports.generateMatchInsight = generateMatchInsight;
exports.analyzeJob = analyzeJob;
const db_1 = require("../../lib/db");
const schema_1 = require("../../lib/schema");
const drizzle_orm_1 = require("drizzle-orm");
const openai_1 = require("../../lib/openai");
const queues_1 = require("../../lib/queues");
// --- queueMatchJob (was a stub) ---
async function queueMatchJob(input) {
    await queues_1.matchQueue.add('match-job', {
        jobId: input.jobId,
        userId: input.userId,
    });
    return { status: 'queued' };
}
// --- getInsightsForJob (was a stub) ---
async function getInsightsForJob(input) {
    const rows = await db_1.db.query.aiInsights.findMany({
        where: (0, drizzle_orm_1.eq)(schema_1.aiInsights.jobId, input.jobId),
        orderBy: (i, { desc }) => [desc(i.createdAt)],
    });
    return rows;
}
// --- match logic (called by the worker) ---
async function getMatchScore(userId, jobId) {
    const job = await db_1.db.query.jobs.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.jobs.id, jobId) });
    if (!job?.description)
        throw new Error('Job has no description');
    const jobEmbedding = await (0, openai_1.generateEmbedding)(job.description);
    const result = await db_1.db.execute((0, drizzle_orm_1.sql) `
    SELECT 1 - (embedding <=> ${JSON.stringify(jobEmbedding)}::vector) AS score
    FROM resumes
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT 1
  `);
    return result.rows[0]?.score ?? 0;
}
async function generateMatchInsight(resumeText, jobDescription, score) {
    const response = await openai_1.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
            {
                role: 'user',
                content: `
          Compare this resume and job description.
          Match score: ${Math.round(score * 100)}%

          Resume: ${resumeText.slice(0, 3000)}
          Job: ${jobDescription.slice(0, 3000)}

          Return JSON with exactly these keys:
          {
            "matchScore": number,
            "missingSkills": string[],
            "strongMatches": string[],
            "recommendation": string
          }
        `,
            },
        ],
    });
    return JSON.parse(response.choices[0].message.content);
}
async function analyzeJob(input) {
    const resume = await db_1.db.query.resumes.findFirst({
        where: (0, drizzle_orm_1.eq)(schema_1.resumes.userId, input.userId),
        orderBy: (r, { desc }) => [desc(r.createdAt)],
    });
    if (!resume?.embedding) {
        throw new Error('No processed resume found. Upload your resume first.');
    }
    const jobEmbedding = await (0, openai_1.generateEmbedding)(input.jobDescription);
    const result = await db_1.db.execute((0, drizzle_orm_1.sql) `
    SELECT 1 - (embedding <=> ${JSON.stringify(jobEmbedding)}::vector) AS score
    FROM resumes
    WHERE user_id = ${input.userId}
    ORDER BY created_at DESC
    LIMIT 1
  `);
    const score = result.rows[0]?.score ?? 0;
    const insight = await generateMatchInsight(resume.rawText, input.jobDescription, score);
    return insight; // { matchScore, missingSkills, strongMatches, recommendation }
}
