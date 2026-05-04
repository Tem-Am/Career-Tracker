"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiInsights = exports.resumes = exports.jobs = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const vector = (0, pg_core_1.customType)({
    dataType(config) {
        if (!config) {
            throw new Error('Vector dimensions are required');
        }
        return `vector(${config.dimensions})`;
    },
    toDriver(value) {
        return `[${value.join(',')}]`;
    },
    fromDriver(value) {
        const trimmed = value.trim();
        const noBrackets = trimmed.startsWith('[') && trimmed.endsWith(']') ? trimmed.slice(1, -1) : trimmed;
        if (noBrackets.length === 0)
            return [];
        return noBrackets.split(',').map((n) => Number(n.trim()));
    },
});
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    email: (0, pg_core_1.text)('email').notNull().unique(),
    passwordHash: (0, pg_core_1.text)('password_hash').notNull(),
    emailVerified: (0, pg_core_1.boolean)('email_verified').default(false),
    verifyToken: (0, pg_core_1.text)('verify_token'), // one-time token sent in email
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).notNull().defaultNow(),
});
exports.jobs = (0, pg_core_1.pgTable)('jobs', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id')
        .notNull()
        .references(() => exports.users.id, { onDelete: 'cascade' }),
    company: (0, pg_core_1.text)('company').notNull(),
    title: (0, pg_core_1.text)('title').notNull(),
    description: (0, pg_core_1.text)('description'),
    status: (0, pg_core_1.text)('status').notNull().default('saved'),
    source: (0, pg_core_1.text)('source'),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).notNull().defaultNow(),
});
exports.resumes = (0, pg_core_1.pgTable)('resumes', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id')
        .notNull()
        .references(() => exports.users.id, { onDelete: 'cascade' }),
    rawText: (0, pg_core_1.text)('raw_text').notNull(),
    embedding: vector('embedding', { dimensions: 1536 }),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).notNull().defaultNow(),
});
exports.aiInsights = (0, pg_core_1.pgTable)('ai_insights', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id')
        .notNull()
        .references(() => exports.users.id, { onDelete: 'cascade' }),
    jobId: (0, pg_core_1.uuid)('job_id')
        .notNull()
        .references(() => exports.jobs.id, { onDelete: 'cascade' }),
    type: (0, pg_core_1.text)('type').notNull(),
    result: (0, pg_core_1.jsonb)('result').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).notNull().defaultNow(),
});
