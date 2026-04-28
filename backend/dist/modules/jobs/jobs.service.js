"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJob = createJob;
exports.getJobsForUser = getJobsForUser;
exports.getJobForUser = getJobForUser;
exports.updateJobForUser = updateJobForUser;
exports.deleteJobForUser = deleteJobForUser;
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("../../lib/db");
const schema_1 = require("../../lib/schema");
async function createJob(input) {
    const inserted = await db_1.db
        .insert(schema_1.jobs)
        .values({
        userId: input.userId,
        company: input.company,
        title: input.title,
        description: input.description,
        status: input.status,
        source: input.source,
    })
        .returning();
    return inserted[0] ?? null;
}
async function getJobsForUser(userId) {
    return db_1.db.select().from(schema_1.jobs).where((0, drizzle_orm_1.eq)(schema_1.jobs.userId, userId)).orderBy((0, drizzle_orm_1.desc)(schema_1.jobs.createdAt));
}
async function getJobForUser(userId, jobId) {
    const rows = await db_1.db
        .select()
        .from(schema_1.jobs)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.jobs.id, jobId), (0, drizzle_orm_1.eq)(schema_1.jobs.userId, userId)))
        .limit(1);
    return rows[0] ?? null;
}
async function updateJobForUser(userId, jobId, patch) {
    const updated = await db_1.db
        .update(schema_1.jobs)
        .set(patch)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.jobs.id, jobId), (0, drizzle_orm_1.eq)(schema_1.jobs.userId, userId)))
        .returning();
    return updated[0] ?? null;
}
async function deleteJobForUser(userId, jobId) {
    const deleted = await db_1.db
        .delete(schema_1.jobs)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.jobs.id, jobId), (0, drizzle_orm_1.eq)(schema_1.jobs.userId, userId)))
        .returning({ id: schema_1.jobs.id });
    return deleted.length > 0;
}
