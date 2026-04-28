"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveResume = saveResume;
exports.getCurrentResume = getCurrentResume;
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("../../lib/db");
const schema_1 = require("../../lib/schema");
async function saveResume(input) {
    const inserted = await db_1.db
        .insert(schema_1.resumes)
        .values({
        userId: input.userId,
        rawText: input.rawText,
    })
        .returning({ id: schema_1.resumes.id });
    const row = inserted[0];
    if (!row) {
        throw new Error('Failed to save resume');
    }
    return row.id;
}
async function getCurrentResume(userId) {
    const rows = await db_1.db
        .select()
        .from(schema_1.resumes)
        .where((0, drizzle_orm_1.eq)(schema_1.resumes.userId, userId))
        .orderBy((0, drizzle_orm_1.desc)(schema_1.resumes.createdAt))
        .limit(1);
    return rows[0] ?? null;
}
