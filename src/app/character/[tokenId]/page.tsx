"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAccount, useReadContract } from "wagmi";
import { CHARACTER_NFT_ADDRESS, CHARACTER_NFT_ABI } from "@/lib/contracts";
import {
  getOccupationName,
  getPersonalityName,
  getGenderLabel,
  getOrientationLabel,
  getLanguageLabel,
} from "@/lib/character-traits";
import Link from "next/link";
import { CharacterInitModal } from "@/components/CharacterInitModal";
import { SignInButton } from "@/components/SignInButton";

export default function CharacterPage() {
  const params = useParams();
  const tokenId = params.tokenId as string;
  const tokenIdNumber = tokenId ? Number(tokenId) : null;
  const { address, isConnected } = useAccount();
  const [showInitModal, setShowInitModal] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Load auth token from localStorage
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setAuthToken(token);
  }, []);

  // Fetch character data
  const { data: character, isLoading: isLoadingCharacter } = useReadContract({
    address: CHARACTER_NFT_ADDRESS,
    abi: CHARACTER_NFT_ABI,
    functionName: "getCharacter",
    args: tokenId ? [BigInt(tokenId)] : undefined,
  });

  // Fetch owner
  const { data: owner, isLoading: isLoadingOwner } = useReadContract({
    address: CHARACTER_NFT_ADDRESS,
    abi: CHARACTER_NFT_ABI,
    functionName: "ownerOf",
    args: tokenId ? [BigInt(tokenId)] : undefined,
  });

  // Check if character is bonded
  const { data: isBonded, isLoading: isLoadingBonded } = useReadContract({
    address: CHARACTER_NFT_ADDRESS,
    abi: CHARACTER_NFT_ABI,
    functionName: "isBonded",
    args: tokenId ? [BigInt(tokenId)] : undefined,
  });

  const isLoading = isLoadingCharacter || isLoadingOwner || isLoadingBonded;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p>Loading character...</p>
        </div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-xl mb-4">Character not found</p>
          <Link href="/" className="text-pink-500 hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const name = character.name;
  const birthTimestamp = character.birthTimestamp;
  const gender = character.gender;
  const sexualOrientation = character.sexualOrientation;
  const occupationId = character.occupationId;
  const personalityId = character.personalityId;
  const language = character.language;
  const mintedAt = character.mintedAt;

  const isOwner = isConnected && owner && address?.toLowerCase() === owner.toLowerCase();
  const mintDate = new Date(Number(mintedAt) * 1000);
  const birthDate = new Date(Number(birthTimestamp) * 1000);

  // Get localized trait names (currently only "en")
  const locale = "en";
  const genderLabel = getGenderLabel(gender, locale);
  const orientationLabel = getOrientationLabel(sexualOrientation, locale);
  const languageLabel = getLanguageLabel(language, locale);
  const occupationName = getOccupationName(occupationId, locale);
  const personalityName = getPersonalityName(personalityId, locale);

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/" className="text-pink-500 hover:underline mb-4 inline-block">
            ← Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-bold">Character #{tokenId}</h1>
            {isOwner && (
              <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-3 py-1 rounded-full text-sm">
                Owner
              </span>
            )}
          </div>
        </div>

        {/* Split Layout - 20/80 */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-[calc(100vh-12rem)]">
          {/* Left Panel - Character Card (20%) */}
          <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 h-fit lg:sticky lg:top-6">
            {/* Character Header */}
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">🎭</div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <h2 className="text-xl font-bold">{name}</h2>
                {isBonded ? (
                  <span className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-2 py-0.5 rounded-full text-xs font-semibold">
                    Bonded
                  </span>
                ) : (
                  <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-0.5 rounded-full text-xs font-semibold">
                    New
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Born {birthDate.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            {/* Basic Info */}
            <div className="mb-4">
              <h3 className="font-semibold text-sm mb-2 text-pink-500">Basic Info</h3>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400 text-xs">Gender:</span>
                  <span className="font-medium text-xs">{genderLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400 text-xs">Orientation:</span>
                  <span className="font-medium text-xs">{orientationLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400 text-xs">Language:</span>
                  <span className="font-medium text-xs">{languageLabel}</span>
                </div>
              </div>
            </div>

            {/* Traits */}
            <div className="mb-4">
              <h3 className="font-semibold text-sm mb-2 text-purple-500">Traits</h3>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400 text-xs">Occupation:</span>
                  <span className="font-medium text-xs">{occupationName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400 text-xs">Personality:</span>
                  <span className="font-medium text-xs">{personalityName}</span>
                </div>
              </div>
            </div>

            {/* Ownership Info */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-sm mb-2">Ownership</h3>
              <div className="space-y-1.5 text-xs">
                <div className="flex flex-col gap-1">
                  <span className="text-gray-600 dark:text-gray-400">Owner:</span>
                  <span className="font-mono break-all">{owner}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-gray-600 dark:text-gray-400">Minted:</span>
                  <span className="font-medium">{mintDate.toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Chat Window (80%) */}
          <div className="lg:col-span-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg flex flex-col">
            {/* Chat Header */}
            <div className="border-b border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-xl font-bold">💬 Chat with {name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AI-powered conversation
              </p>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 p-6 overflow-y-auto relative">
              {/* Show init modal if needed */}
              {showInitModal && tokenIdNumber !== null && !isNaN(tokenIdNumber) && (
                <CharacterInitModal
                  tokenId={tokenIdNumber}
                  characterName={name}
                  authToken={authToken}
                  onComplete={() => {
                    setShowInitModal(false);
                    setIsInitialized(true);
                  }}
                  onClose={() => setShowInitModal(false)}
                />
              )}

              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md">
                  {!isBonded && !isInitialized ? (
                    // Not bonded yet
                    <>
                      <div className="text-6xl mb-4">✨</div>
                      <h4 className="text-xl font-bold mb-2">Bond with Your Character</h4>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Before you can start chatting with {name}, bond with them to generate a unique backstory and personality.
                      </p>
                      {!isOwner ? (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 p-4 rounded-lg">
                          You must be the owner to bond with this character.
                        </div>
                      ) : !authToken ? (
                        <div className="space-y-4">
                          <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 p-4 rounded-lg mb-4">
                            Please sign a message to authenticate with your wallet.
                          </div>
                          <SignInButton onSignIn={() => setAuthToken(localStorage.getItem('authToken'))} />
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowInitModal(true)}
                          className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium rounded-lg
                                   hover:from-pink-600 hover:to-purple-600 transition-all text-lg"
                        >
                          Bond Character
                        </button>
                      )}
                    </>
                  ) : (
                    // Bonded - ready for chat
                    <>
                      <div className="text-6xl mb-4">💬</div>
                      <h4 className="text-xl font-bold mb-2">Chat Feature Coming Soon!</h4>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Character is bonded and ready to chat!
                      </p>
                      <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 p-4 rounded-lg">
                        ✅ Backstory generated<br />
                        ✅ Personality configured<br />
                        🚧 Chat interface in development
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Chat Input (Disabled for now) */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  disabled
                  placeholder={
                    !isBonded && !isInitialized
                      ? "Bond character first..."
                      : "Chat input coming soon..."
                  }
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                />
                <button
                  disabled
                  className="px-6 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
