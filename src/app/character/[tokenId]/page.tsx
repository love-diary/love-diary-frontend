"use client";

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

export default function CharacterPage() {
  const params = useParams();
  const tokenId = params.tokenId as string;
  const { address, isConnected } = useAccount();

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

  const isLoading = isLoadingCharacter || isLoadingOwner;

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
  const birthYear = character.birthYear;
  const gender = character.gender;
  const sexualOrientation = character.sexualOrientation;
  const occupationId = character.occupationId;
  const personalityId = character.personalityId;
  const language = character.language;
  const mintedAt = character.mintedAt;

  const isOwner = isConnected && owner && address?.toLowerCase() === owner.toLowerCase();
  const mintDate = new Date(Number(mintedAt) * 1000);

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
              <h2 className="text-xl font-bold mb-1">{name}</h2>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Born {Number(birthYear)}
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
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md">
                  <div className="text-6xl mb-4">🤖</div>
                  <h4 className="text-xl font-bold mb-2">Chat Coming Soon!</h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Soon you&apos;ll be able to have AI-powered conversations with your character.
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      🚀 Features coming soon:
                    </p>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1">
                      <li>• Real-time AI conversations</li>
                      <li>• Personality-based responses</li>
                      <li>• Relationship building</li>
                      <li>• Gift sending</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Input (Disabled) */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  disabled
                  placeholder="Type your message... (Coming Soon)"
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
