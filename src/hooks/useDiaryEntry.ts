/**
 * Hook for fetching a specific diary entry
 */

import { useState, useEffect } from 'react';

export interface DiaryEntry {
  date: string;
  entry: string;
  messageCount: number;
}

export function useDiaryEntry(
  tokenId: number | null,
  date: string | null,
  authToken: string | null
) {
  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tokenId || !date || !authToken) {
      return;
    }

    const fetchDiaryEntry = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/diary/${tokenId}/entry?date=${date}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch diary entry');
        }

        setEntry(data);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        console.error('Failed to fetch diary entry:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiaryEntry();
  }, [tokenId, date, authToken]);

  return {
    entry,
    isLoading,
    error,
  };
}
