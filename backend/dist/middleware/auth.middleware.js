"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const jwtPayloadSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid(),
});
function authMiddleware(req, res, next) {
    const header = req.header('authorization');
    if (!header || !header.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    const token = header.slice('Bearer '.length).trim();
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        res.status(500).json({ error: 'JWT_SECRET is not configured' });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        const parsed = jwtPayloadSchema.safeParse(decoded);
        if (!parsed.success) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        req.user = { id: parsed.data.userId };
        next();
    }
    catch {
        res.status(401).json({ error: 'Unauthorized' });
    }
}
