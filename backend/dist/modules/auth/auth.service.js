"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
exports.loginUser = loginUser;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("../../lib/db");
const schema_1 = require("../../lib/schema");
function requireJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret)
        throw new Error('JWT_SECRET is required');
    return secret;
}
function signToken(userId) {
    return jsonwebtoken_1.default.sign({ userId }, requireJwtSecret(), { expiresIn: '7d' });
}
async function registerUser(input) {
    const existing = await db_1.db
        .select({ id: schema_1.users.id })
        .from(schema_1.users)
        .where((0, drizzle_orm_1.eq)(schema_1.users.email, input.email))
        .limit(1);
    if (existing.length > 0) {
        throw new Error('Email already in use');
    }
    const passwordHash = await bcryptjs_1.default.hash(input.password, 10);
    const created = await db_1.db
        .insert(schema_1.users)
        .values({
        email: input.email,
        passwordHash,
    })
        .returning({ id: schema_1.users.id, email: schema_1.users.email });
    const user = created[0];
    if (!user) {
        throw new Error('Failed to create user');
    }
    return { token: signToken(user.id), user };
}
async function loginUser(input) {
    const rows = await db_1.db
        .select({ id: schema_1.users.id, email: schema_1.users.email, passwordHash: schema_1.users.passwordHash })
        .from(schema_1.users)
        .where((0, drizzle_orm_1.eq)(schema_1.users.email, input.email))
        .limit(1);
    const row = rows[0];
    if (!row) {
        throw new Error('Invalid credentials');
    }
    const ok = await bcryptjs_1.default.compare(input.password, row.passwordHash);
    if (!ok) {
        throw new Error('Invalid credentials');
    }
    return { token: signToken(row.id), user: { id: row.id, email: row.email } };
}
