"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiRouter = void 0;
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const auth_middleware_1 = require("../../middleware/auth.middleware");
// import { requireVerifiedEmail } from '../../middleware/verified.middleware';
const rateLimit_1 = require("../../middleware/rateLimit");
const ai_service_1 = require("./ai.service");
const jobIdSchema = zod_1.z.object({
    jobId: zod_1.z.string().uuid(),
});
const analyzeSchema = zod_1.z.object({
    jobDescription: zod_1.z.string().min(50, 'Job description must be at least 50 characters'),
});
function asyncHandler(fn) {
    return (req, res, next) => {
        fn(req, res).catch(next);
    };
}
exports.aiRouter = express_1.default.Router();
exports.aiRouter.use(auth_middleware_1.authMiddleware);
// ── existing routes ──────────────────────────────────────────────────────────
exports.aiRouter.post('/match/:jobId', rateLimit_1.checkAnalyzeLimit, asyncHandler(async (req, res) => {
    const params = jobIdSchema.safeParse(req.params);
    if (!params.success) {
        res.status(400).json({ error: params.error.message });
        return;
    }
    const userId = req.user?.id;
    if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    const result = await (0, ai_service_1.queueMatchJob)({ userId, jobId: params.data.jobId });
    res.json(result);
}));
exports.aiRouter.get('/insights/:jobId', asyncHandler(async (req, res) => {
    const params = jobIdSchema.safeParse(req.params);
    if (!params.success) {
        res.status(400).json({ error: params.error.message });
        return;
    }
    const userId = req.user?.id;
    if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    const result = await (0, ai_service_1.getInsightsForJob)({ userId, jobId: params.data.jobId });
    res.json(result);
}));
// ── new: analyze without saving a job ───────────────────────────────────────
// aiRouter.post(
//   '/analyze',
//   // requireVerifiedEmail,
//   // checkAnalyzeLimit,
//   asyncHandler(async (req, res) => {
//     const body = analyzeSchema.safeParse(req.body);
//     if (!body.success) { res.status(400).json({ error: body.error.flatten() }); return; }
//     const userId = req.user?.id;
//     if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }
//     const result = await analyzeJob({ userId, jobDescription: body.data.jobDescription });
//     res.json({
//       ...result,
//       remaining: Number(res.getHeader('X-Analyze-Remaining') ?? 0),
//     });
//   }),
// );
