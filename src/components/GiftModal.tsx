/**
 * Modal for sending LOVE token gifts to character
 */

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { LOVE_TOKEN_ADDRESS, LOVE_TOKEN_ABI } from '@/lib/contracts';
import { parseEther, formatEther } from 'viem';
import { createPortal } from 'react-dom';
import { useEffect } from 'react';

interface GiftModalProps {
  tokenId: number;
  authToken: string;
  characterName: string;
  characterWallet: string;
  onClose: () => void;
  onSuccess: (affectionChange: number) => void;
}

const GIFT_AMOUNTS = [100, 200, 500, 1000];

export function GiftModal({
  tokenId,
  authToken,
  characterName,
  characterWallet,
  onClose,
  onSuccess,
}: GiftModalProps) {
  const { address } = useAccount();
  const [amount, setAmount] = useState(100);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const { writeContract, data: hash, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Ensure component only renders on client side
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Handle transaction success
  useEffect(() => {
    if (isSuccess && hash) {
      verifyGift(hash);
    }
  }, [isSuccess, hash]);

  const handleSendGift = () => {
    if (!address) {
      setError('Please connect your wallet');
      return;
    }

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
    }
  };

  const verifyGift = async (txHash: `0x${string}`) => {
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
      onSuccess(data.affectionChange);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Verification failed';
      setError(message);
    } finally {
      setIsVerifying(false);
    }
  };

  if (!mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-xl font-bold">Send Gift to {characterName}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Show your affection with LOVE tokens
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Amount Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">
              Select Gift Amount
            </label>
            <div className="grid grid-cols-2 gap-3">
              {GIFT_AMOUNTS.map((giftAmount) => (
                <button
                  key={giftAmount}
                  onClick={() => setAmount(giftAmount)}
                  disabled={isPending || isConfirming || isVerifying}
                  className={`px-4 py-3 rounded-lg border-2 transition-all font-medium
                    ${amount === giftAmount
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                      : 'border-gray-300 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-700'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="text-lg font-bold">{giftAmount} LOVE</div>
                  <div className="text-xs opacity-75">+{Math.floor(giftAmount / 20)} affection</div>
                </button>
              ))}
            </div>
          </div>

          {/* Character Wallet */}
          <div className="mb-6">
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              Character Wallet:
            </label>
            <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs font-mono break-all">
              {characterWallet}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Status Messages */}
          {isPending && (
            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 p-3 rounded-lg mb-4 text-sm">
              Please confirm transaction in your wallet...
            </div>
          )}

          {isConfirming && (
            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
              Waiting for confirmation...
            </div>
          )}

          {isVerifying && (
            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
              Verifying gift...
            </div>
          )}

          {/* Send Button */}
          <button
            onClick={handleSendGift}
            disabled={isPending || isConfirming || isVerifying || !address}
            className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium rounded-lg
                     hover:from-pink-600 hover:to-purple-600 transition-all
                     disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed
                     flex items-center justify-center gap-2"
          >
            {isPending || isConfirming || isVerifying ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Processing...
              </>
            ) : (
              `Send ${amount} LOVE`
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
