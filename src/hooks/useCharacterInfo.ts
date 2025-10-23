/**
 * Hook for fetching character information
 */

import { useState, useEffect, useCallback } from 'react';

export interface CharacterInfo {
  affectionLevel: number;
  backstory: string;
  recentConversation: Array<{
    sender: 'player' | 'character';
    text: string;
    timestamp: number;
  }>;
  totalMessages: number;
  playerName: string;
  playerGender: string;
  imageUrl?: string;
}

export function useCharacterInfo(tokenId: number | null, authToken: string | null, isBonded: boolean) {
  const [characterInfo, setCharacterInfo] = useState<CharacterInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCharacterInfo = useCallback(async () => {
    // Don't fetch if prerequisites aren't met
    if (!tokenId || !authToken || !isBonded) {
      setCharacterInfo(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/chat/info?tokenId=${tokenId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        // 404 means character not initialized yet - this is normal, not an error
        if (response.status === 404) {
          setCharacterInfo(null);
          setError(null);
          return;
        }

        const errorData = await response.json();
        const errorMsg = errorData.details || errorData.error || 'Failed to fetch character info';
        throw new Error(errorMsg);
      }

      const data: CharacterInfo = await response.json();
      setCharacterInfo(data);
    } catch (err: unknown) {
      // Don't treat 404 as an error in console
      if (err instanceof Error && !err.message.includes('404') && !err.message.includes('not initialized')) {
        const errorMessage = err.message;
        setError(errorMessage);
        console.error('Failed to fetch character info:', errorMessage);
      } else {
        // Character just not initialized yet
        setCharacterInfo(null);
        setError(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [tokenId, authToken, isBonded]);

  // Fetch on mount and when dependencies change
  useEffect(() => {
    fetchCharacterInfo();
  }, [fetchCharacterInfo]);

  return {
    characterInfo,
    isLoading,
    error,
    refetch: fetchCharacterInfo,
  };
}
