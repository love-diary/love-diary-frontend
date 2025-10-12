'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits } from 'viem';
import { useEffect, useState } from 'react';
import { LOVE_TOKEN_ADDRESS, LOVE_TOKEN_ABI, FAUCET_ADDRESS, FAUCET_ABI } from '@/lib/contracts';

export function FaucetClaim() {
  const { address, isConnected } = useAccount();
  const [timeUntilClaim, setTimeUntilClaim] = useState<number>(0);

  // Read LOVE token balance
  const { data: balance, isLoading: isLoadingBalance } = useReadContract({
    address: LOVE_TOKEN_ADDRESS,
    abi: LOVE_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Check if user can claim
  const { data: canClaim, isLoading: isLoadingCanClaim } = useReadContract({
    address: FAUCET_ADDRESS,
    abi: FAUCET_ABI,
    functionName: 'canClaim',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 1000, // Refetch every second
    },
  });

  // Get next claim time
  const { data: nextClaimTime } = useReadContract({
    address: FAUCET_ADDRESS,
    abi: FAUCET_ABI,
    functionName: 'getNextClaimTime',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !canClaim,
      refetchInterval: 1000,
    },
  });

  // Write contract for claiming
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Calculate time until next claim
  useEffect(() => {
    if (!nextClaimTime || canClaim) {
      setTimeUntilClaim(0);
      return;
    }

    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000);
      const next = Number(nextClaimTime);
      const remaining = Math.max(0, next - now);
      setTimeUntilClaim(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [nextClaimTime, canClaim]);

  const handleClaim = async () => {
    try {
      writeContract({
        address: FAUCET_ADDRESS,
        abi: FAUCET_ABI,
        functionName: 'claim',
      });
    } catch (err) {
      console.error('Failed to claim:', err);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-md mx-auto">
      {/* Connect Button */}
      <div className="w-full flex justify-center">
        <ConnectButton />
      </div>

      {isConnected && (
        <>
          {/* Balance Display */}
          <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
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
            </div>
          </div>

          {/* Claim Section */}
          <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-center mb-4">Faucet Claim</h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
              Claim 10,000 LOVE tokens every hour
            </p>

            {isLoadingCanClaim ? (
              <div className="text-center">
                <p className="text-gray-400 mb-4">Loading claim status...</p>
                <button
                  disabled
                  className="w-full bg-gray-400 text-white font-bold py-3 px-6 rounded-lg cursor-not-allowed"
                >
                  Loading...
                </button>
              </div>
            ) : canClaim ? (
              <button
                onClick={handleClaim}
                disabled={isPending || isConfirming}
                className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                {isPending || isConfirming ? 'Claiming...' : 'Claim 10,000 LOVE'}
              </button>
            ) : (
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-2">Next claim available in:</p>
                <p className="text-2xl font-bold text-pink-500">{formatTime(timeUntilClaim)}</p>
                <button
                  disabled
                  className="w-full mt-4 bg-gray-400 text-white font-bold py-3 px-6 rounded-lg cursor-not-allowed"
                >
                  Claim 10,000 LOVE
                </button>
              </div>
            )}

            {/* Transaction Status */}
            {isConfirming && (
              <div className="mt-4 p-4 bg-blue-100 dark:bg-blue-900 rounded text-center">
                <p className="text-blue-800 dark:text-blue-200">Transaction confirming...</p>
              </div>
            )}

            {isSuccess && (
              <div className="mt-4 p-4 bg-green-100 dark:bg-green-900 rounded text-center">
                <p className="text-green-800 dark:text-green-200">Successfully claimed 10,000 LOVE!</p>
                {hash && (
                  <a
                    href={`https://sepolia.basescan.org/tx/${hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-green-600 dark:text-green-400 hover:underline mt-2 block"
                  >
                    View on Basescan
                  </a>
                )}
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-100 dark:bg-red-900 rounded text-center">
                <p className="text-red-800 dark:text-red-200 text-sm">
                  Error: {error.message}
                </p>
              </div>
            )}
          </div>

          {/* Network Info */}
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>Connected to Base Sepolia Testnet</p>
            <p className="mt-1">
              Contract: {FAUCET_ADDRESS.slice(0, 6)}...{FAUCET_ADDRESS.slice(-4)}
            </p>
          </div>
        </>
      )}

      {!isConnected && (
        <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Connect your wallet to claim LOVE tokens
          </p>
        </div>
      )}
    </div>
  );
}
