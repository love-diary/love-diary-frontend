/**
 * Inline gift selector for sending LOVE tokens in chat
 */

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { LOVE_TOKEN_ADDRESS, LOVE_TOKEN_ABI } from '@/lib/contracts';
import { parseEther } from 'viem';

interface InlineGiftSelectorProps {
  tokenId: number;
  authToken: string;
  characterWallet: string;
  onClose: () => void;
  onSuccess: (affectionChange: number, characterMessage: string, giftAmount: number) => void;
}

const GIFT_AMOUNTS = [100, 200, 500, 1000];

export function InlineGiftSelector({
  tokenId,
  authToken,
  characterWallet,
  onClose,
  onSuccess,
}: InlineGiftSelectorProps) {
  const { address } = useAccount();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { writeContract, data: hash, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Handle transaction success
  useEffect(() => {
    if (isSuccess && hash && selectedAmount) {
      verifyGift(hash, selectedAmount);
    }
  }, [isSuccess, hash, selectedAmount]);

  const handleSendGift = (amount: number) => {
    if (!address) {
      setError('Please connect your wallet');
      return;
    }

    setSelectedAmount(amount);
    setError(null);

    try {
      writeContract({
        address: LOVE_TOKEN_ADDRESS,
        abi: LOVE_TOKEN_ABI,
        functionName: 'transfer',
        args: [characterWallet as `0x${string}`, parseEther(amount.toString())],
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Transaction failed';
      setError(message);
      setSelectedAmount(null);
    }
  };

  const verifyGift = async (txHash: `0x${string}`, amount: number) => {
    setIsVerifying(true);
    setError(null);

    try {
      // Wait 2 seconds for RPC nodes to index the transaction
      await new Promise(resolve => setTimeout(resolve, 2000));

      const response = await fetch(`/api/wallet/${tokenId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          txHash,
          amount: parseEther(amount.toString()).toString(),
        }),
      });

      const data = await response.json();

      if (!response.ok || data.status === 'failed') {
        throw new Error(data.message || 'Gift verification failed');
      }

      // Success!
      onSuccess(data.affectionChange, data.characterMessage, amount);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Verification failed';
      setError(message);
      setSelectedAmount(null);
    } finally {
      setIsVerifying(false);
    }
  };

  const isProcessing = isPending || isConfirming || isVerifying;

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Send Gift</span>
          {isProcessing && (
            <span className="inline-block w-3 h-3 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-lg"
        >
          ✕
        </button>
      </div>

      {/* Gift Amount Buttons */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {GIFT_AMOUNTS.map((amount) => (
          <button
            key={amount}
            onClick={() => handleSendGift(amount)}
            disabled={isProcessing || !address}
            className={`px-3 py-2 rounded-lg border-2 transition-all text-sm font-medium
              ${isProcessing
                ? 'border-gray-300 dark:border-gray-600 opacity-50 cursor-not-allowed'
                : 'border-pink-300 dark:border-pink-700 hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:border-pink-500'
              }`}
          >
            <div className="font-bold">{amount}</div>
            <div className="text-xs opacity-75">LOVE</div>
          </button>
        ))}
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-2 rounded text-xs mb-2">
          {error}
        </div>
      )}

      {isPending && (
        <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 p-2 rounded text-xs">
          Please confirm transaction in your wallet...
        </div>
      )}

      {isConfirming && (
        <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 p-2 rounded text-xs">
          Waiting for confirmation...
        </div>
      )}

      {isVerifying && (
        <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 p-2 rounded text-xs">
          Sending...
        </div>
      )}
    </div>
  );
}
