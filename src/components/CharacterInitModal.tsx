/**
 * Modal for initializing first-time chat with a character
 * Shows during backstory generation
 */

import { useState, useEffect } from 'react';
import { useCharacterInit } from '@/hooks/useCharacterInit';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CHARACTER_NFT_ADDRESS, CHARACTER_NFT_ABI } from '@/lib/contracts';

interface CharacterInitModalProps {
  tokenId: number;
  characterName: string;
  authToken: string | null;
  onComplete: () => void;
  onClose: () => void;
}

export function CharacterInitModal({
  tokenId,
  characterName,
  authToken,
  onComplete,
  onClose,
}: CharacterInitModalProps) {
  const [playerName, setPlayerName] = useState('');
  const [playerGender, setPlayerGender] = useState('Female');
  const [bondComplete, setBondComplete] = useState(false);
  const { initializeCharacter, isInitializing, error, result } = useCharacterInit();

  // Contract write for bond()
  const { writeContract, data: bondTxHash, isPending: isBondPending, error: bondError } = useWriteContract();
  const { isLoading: isBondConfirming, isSuccess: isBondSuccess } = useWaitForTransactionReceipt({
    hash: bondTxHash,
  });

  // Step 2: Automatically generate backstory after bond is confirmed on-chain
  useEffect(() => {
    if (isBondSuccess && !bondComplete && authToken) {
      setBondComplete(true);

      const generateBackstory = async () => {
        try {
          await initializeCharacter(tokenId, authToken, playerName, playerGender);
        } catch (err) {
          // Error is handled by the hook
        }
      };

      generateBackstory();
    }
  }, [isBondSuccess, bondComplete, authToken, tokenId, playerName, playerGender, initializeCharacter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authToken) {
      alert('Please sign in first');
      return;
    }

    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }

    // Step 1: Call bond() on contract first (user commits via wallet)
    writeContract({
      address: CHARACTER_NFT_ADDRESS,
      abi: CHARACTER_NFT_ABI,
      functionName: 'bond',
      args: [BigInt(tokenId)],
    });
  };

  return (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-w-md w-full mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Bond with {characterName}</h3>
          {!isInitializing && !isBondPending && !isBondConfirming && !(isBondSuccess && result) && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          )}
        </div>

        {/* Content */}
        {!(isBondSuccess && result) ? (
          // Form or Loading
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isInitializing && !isBondPending && !isBondConfirming ? (
              <>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Before you can start chatting, we need to generate a unique backstory for {characterName}.
                  This takes about 2-5 seconds.
                </p>

                {/* Player Name Input */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             bg-white dark:bg-gray-800 focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>

                {/* Player Gender Input */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Your Gender
                  </label>
                  <select
                    value={playerGender}
                    onChange={(e) => setPlayerGender(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             bg-white dark:bg-gray-800 focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="NonBinary">Non Binary</option>
                  </select>
                </div>

                {/* Error Message */}
                {(error || bondError) && (
                  <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
                    {error || bondError?.message || 'An error occurred'}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isInitializing || isBondPending || isBondConfirming}
                  className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium rounded-lg
                           hover:from-pink-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Bond & Generate Backstory
                </button>
              </>
            ) : (
              // Loading State
              <div className="text-center py-8">
                <div className="inline-block animate-spin text-6xl mb-4">⏳</div>
                <h4 className="text-lg font-bold mb-2">
                  {isBondPending || isBondConfirming
                    ? "Bonding Character On-Chain..."
                    : isInitializing
                    ? "Generating Backstory..."
                    : "Complete!"}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isBondPending
                    ? "Please confirm the transaction in your wallet..."
                    : isBondConfirming
                    ? "Waiting for blockchain confirmation..."
                    : isInitializing
                    ? `Creating a unique background story for ${characterName}`
                    : "Finalizing..."}
                </p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
          </form>
        ) : (
          // Success State
          <div className="space-y-4">
            <div className="text-center text-6xl mb-4">✨</div>
            <h4 className="text-lg font-bold text-center">Character Bonded!</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Your character has been bonded on-chain and is ready for adventure!
            </p>

            {/* Show error if backstory generation failed */}
            {error && !result?.backstorySummary && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 p-4 rounded-lg text-sm">
                ⚠️ Character bonded on-chain, but backstory generation encountered an issue: {error}
              </div>
            )}

            {/* Backstory */}
            {result?.backstorySummary && (
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <h5 className="font-semibold text-sm mb-2 text-purple-600 dark:text-purple-400">
                  Backstory Summary
                </h5>
                <div className="text-sm text-gray-700 dark:text-gray-300 max-h-32 overflow-y-auto whitespace-pre-line">
                  {result.backstorySummary}
                </div>
              </div>
            )}

            {/* First Message */}
            {result?.firstMessage && (
              <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-4">
                <h5 className="font-semibold text-sm mb-2 text-pink-600 dark:text-pink-400">
                  First Message
                </h5>
                <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                  &quot;{result.firstMessage}&quot;
                </p>
              </div>
            )}

            {/* Start Chatting Button */}
            <button
              onClick={onComplete}
              className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium rounded-lg
                       hover:from-pink-600 hover:to-purple-600 transition-all"
            >
              Start Chatting 💬
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
