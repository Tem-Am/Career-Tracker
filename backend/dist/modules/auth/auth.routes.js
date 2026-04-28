"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const auth_service_1 = require("./auth.service");
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
function asyncHandler(fn) {
    return (req, res, next) => {
        fn(req, res).catch(next);
    };
}
exports.authRouter = express_1.default.Router();
exports.authRouter.post('/register', asyncHandler(async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.message });
        return;
    }
    try {
        const result = await (0, auth_service_1.registerUser)(parsed.data);
        res.json(result);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to register';
        res.status(400).json({ error: message });
    }
}));
exports.authRouter.post('/login', asyncHandler(async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.message });
        return;
    }
    try {
        const result = await (0, auth_service_1.loginUser)(parsed.data);
        res.json(result);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to login';
        res.status(401).json({ error: message });
    }
}));
