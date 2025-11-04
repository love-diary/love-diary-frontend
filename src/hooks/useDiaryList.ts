/**
 * Hook for fetching diary list for a character
 */

import { useState, useEffect } from 'react';

export interface DiaryListItem {
  date: string;
  messageCount: number;
}

export function useDiaryList(
  tokenId: number | null,
  authToken: string | null,
  enabled: boolean = true
) {
  const [diaries, setDiaries] = useState<DiaryListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tokenId === null || tokenId === undefined || !authToken || !enabled) {
      return;
    }

    const fetchDiaryList = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/diary/${tokenId}/list`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch diary list');
        }

        setDiaries(data);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        console.error('Failed to fetch diary list:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiaryList();
  }, [tokenId, authToken, enabled]);

  return {
    diaries,
    isLoading,
    error,
  };
}
