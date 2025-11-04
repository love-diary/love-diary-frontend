/**
 * Hook for fetching character wallet information
 */

import { useState, useEffect } from 'react';

interface WalletInfo {
  walletAddress: string;
  loveBalance: bigint;
}

export function useCharacterWallet(
  tokenId: number | null,
  authToken: string | null,
  enabled: boolean = true
) {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchWallet = async () => {
    if (!enabled || tokenId === null || tokenId === undefined || !authToken) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/wallet/${tokenId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch wallet info');
      }

      const data = await response.json();
      setWallet({
        walletAddress: data.walletAddress,
        loveBalance: BigInt(data.loveBalance),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('Failed to fetch wallet info:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, [tokenId, authToken, enabled, refreshKey]);

  const refetch = () => setRefreshKey(prev => prev + 1);

  return { wallet, isLoading, error, refetch };
}
