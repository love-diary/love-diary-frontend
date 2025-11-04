'use client';

import { useAccount, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { LOVE_TOKEN_ADDRESS, LOVE_TOKEN_ABI } from '@/lib/contracts';

export function LoveBalance() {
  const { address, isConnected } = useAccount();

  // Read LOVE token balance
  const { data: balance, isLoading: isLoadingBalance } = useReadContract({
    address: LOVE_TOKEN_ADDRESS,
    abi: LOVE_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 5000, // Refetch every 5 seconds
    },
  });

  if (!isConnected) {
    return null;
  }

  return (
    <div className="w-full max-w-md mx-auto mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Your LOVE Balance</p>
        {isLoadingBalance ? (
          <p className="text-4xl font-bold text-gray-400">
            Loading...
          </p>
        ) : (
          <p className="text-4xl font-bold text-pink-500">
            {balance ? formatUnits(balance as bigint, 18) : '0'} LOVE
          </p>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          <a
            href={`https://basescan.org/token/${LOVE_TOKEN_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            View Token on Basescan
          </a>
        </p>
      </div>
    </div>
  );
}
