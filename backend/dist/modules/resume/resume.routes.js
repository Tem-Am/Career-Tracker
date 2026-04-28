"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resumeRouter = void 0;
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const resume_service_1 = require("./resume.service");
const saveResumeSchema = zod_1.z.object({
    rawText: zod_1.z.string().min(1),
});
function asyncHandler(fn) {
    return (req, res, next) => {
        fn(req, res).catch(next);
    };
}
exports.resumeRouter = express_1.default.Router();
exports.resumeRouter.use(auth_middleware_1.authMiddleware);
exports.resumeRouter.post('/', asyncHandler(async (req, res) => {
    const parsed = saveResumeSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.message });
        return;
    }
    const userId = req.user?.id;
    if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    const id = await (0, resume_service_1.saveResume)({ userId, rawText: parsed.data.rawText });
    res.status(201).json({ id });
}));
exports.resumeRouter.get('/', asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    const resume = await (0, resume_service_1.getCurrentResume)(userId);
    if (!resume) {
        res.status(404).json({ error: 'Resume not found' });
        return;
    }
    res.json(resume);
}));
