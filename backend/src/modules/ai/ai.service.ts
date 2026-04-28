export async function queueMatchJob(_input: { userId: string; jobId: string }) {
  return { status: 'queued' as const };
}

export async function getInsightsForJob(_input: { userId: string; jobId: string }) {
  return { status: 'pending' as const };
}

