"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const resumeWorker_1 = require("./resumeWorker");
const matchWorker_1 = require("./matchWorker");
console.log('[workers] Starting...');
async function shutdown() {
    console.log('[workers] SIGTERM received — draining and shutting down...');
    await Promise.all([
        resumeWorker_1.resumeWorker.close(),
        matchWorker_1.matchWorker.close(),
    ]);
    console.log('[workers] All workers closed cleanly.');
    process.exit(0);
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
