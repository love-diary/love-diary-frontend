/**
 * Hook for initializing character chat (first-time bonding and backstory generation)
 */

import { useState } from 'react';

interface InitResponse {
  status: 'created' | 'already_exists';
  firstMessage?: string;
  backstorySummary?: string;
  agentAddress?: string;
}

export function useCharacterInit() {
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InitResponse | null>(null);

  const initializeCharacter = async (
    tokenId: number,
    authToken: string,
    playerName: string,
    playerGender: string,
    playerTimezone: number
  ) => {
    setIsInitializing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/chat/init', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokenId,
          playerName,
          playerGender,
          playerTimezone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize character');
      }

      setResult(data);
      return data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsInitializing(false);
    }
  };

  return {
    initializeCharacter,
    isInitializing,
    error,
    result,
  };
}
