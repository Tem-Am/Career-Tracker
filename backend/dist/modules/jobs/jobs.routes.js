"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobsRouter = void 0;
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const jobs_service_1 = require("./jobs.service");
const jobStatusSchema = zod_1.z.enum(['saved', 'applied', 'interview', 'offer', 'rejected']);
const createJobSchema = zod_1.z.object({
    company: zod_1.z.string().min(1),
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().min(1).optional().nullable(),
    status: jobStatusSchema.optional(),
    source: zod_1.z.string().min(1).optional().nullable(),
});
const jobIdSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
});
const updateJobSchema = zod_1.z
    .object({
    company: zod_1.z.string().min(1).optional(),
    title: zod_1.z.string().min(1).optional(),
    description: zod_1.z.string().min(1).optional(),
    status: jobStatusSchema.optional(),
    source: zod_1.z.string().min(1).nullable().optional(),
})
    .strict();
function asyncHandler(fn) {
    return (req, res, next) => {
        fn(req, res).catch(next);
    };
}
exports.jobsRouter = express_1.default.Router();
exports.jobsRouter.use(auth_middleware_1.authMiddleware);
exports.jobsRouter.post('/', asyncHandler(async (req, res) => {
    const parsed = createJobSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.message });
        return;
    }
    const userId = req.user?.id;
    if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    const job = await (0, jobs_service_1.createJob)({ userId, ...parsed.data });
    res.status(201).json(job);
}));
exports.jobsRouter.get('/', asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    const rows = await (0, jobs_service_1.getJobsForUser)(userId);
    res.json(rows);
}));
exports.jobsRouter.get('/:id', asyncHandler(async (req, res) => {
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
    const job = await (0, jobs_service_1.getJobForUser)(userId, params.data.id);
    if (!job) {
        res.status(404).json({ error: 'Job not found' });
        return;
    }
    res.json(job);
}));
exports.jobsRouter.patch('/:id', asyncHandler(async (req, res) => {
    const params = jobIdSchema.safeParse(req.params);
    if (!params.success) {
        res.status(400).json({ error: params.error.message });
        return;
    }
    const parsed = updateJobSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.message });
        return;
    }
    if (Object.keys(parsed.data).length === 0) {
        res.status(400).json({ error: 'No fields to update' });
        return;
    }
    const userId = req.user?.id;
    if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    const updated = await (0, jobs_service_1.updateJobForUser)(userId, params.data.id, parsed.data);
    if (!updated) {
        res.status(404).json({ error: 'Job not found' });
        return;
    }
    res.json(updated);
}));
exports.jobsRouter.delete('/:id', asyncHandler(async (req, res) => {
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
    const ok = await (0, jobs_service_1.deleteJobForUser)(userId, params.data.id);
    if (!ok) {
        res.status(404).json({ error: 'Job not found' });
        return;
    }
    res.status(204).send();
}));
