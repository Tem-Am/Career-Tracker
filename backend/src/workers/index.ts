import { resumeWorker } from './resumeWorker'
import { matchWorker } from './matchWorker'
 
console.log('[workers] Starting...')
 
async function shutdown() {
  console.log('[workers] SIGTERM received — draining and shutting down...')
  await Promise.all([
    resumeWorker.close(),
    matchWorker.close(),
  ])
  console.log('[workers] All workers closed cleanly.')
  process.exit(0)
}
 
process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
 