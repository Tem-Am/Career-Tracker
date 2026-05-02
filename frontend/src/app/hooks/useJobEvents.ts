import { useEffect } from 'react';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function useJobEvents(onMatchComplete: (jobId: string) => void) {
  useEffect(() => {
    const token = localStorage.getItem('jt-token');
    if (!token) return;

    const es = new EventSource(`${BASE_URL}/events?token=${encodeURIComponent(token)}`);

    es.addEventListener('match-complete', (e) => {
      const { jobId } = JSON.parse(e.data);
      onMatchComplete(jobId);
    });

    return () => es.close();
  }, [onMatchComplete]);
}