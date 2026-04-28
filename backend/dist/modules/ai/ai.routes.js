"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiRouter = void 0;
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const ai_service_1 = require("./ai.service");
const jobIdSchema = zod_1.z.object({
    jobId: zod_1.z.string().uuid(),
});
function asyncHandler(fn) {
    return (req, res, next) => {
        fn(req, res).catch(next);
    };
}
exports.aiRouter = express_1.default.Router();
exports.aiRouter.use(auth_middleware_1.authMiddleware);
exports.aiRouter.post('/match/:jobId', asyncHandler(async (req, res) => {
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
