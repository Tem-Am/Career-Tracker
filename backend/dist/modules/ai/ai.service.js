"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queueMatchJob = queueMatchJob;
exports.getInsightsForJob = getInsightsForJob;
async function queueMatchJob(_input) {
    return { status: 'queued' };
}
async function getInsightsForJob(_input) {
    return { status: 'pending' };
}
