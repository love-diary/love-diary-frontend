"use client";

import { useState, useEffect, useRef } from "react";
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
import { BackstoryModal } from "@/components/BackstoryModal";
import { useChat } from "@/hooks/useChat";
import { useCharacterInfo } from "@/hooks/useCharacterInfo";

export default function CharacterPage() {
  const params = useParams();
  const tokenId = params.tokenId as string;
  const tokenIdNumber = tokenId ? Number(tokenId) : null;
  const { address, isConnected } = useAccount();
  const [showInitModal, setShowInitModal] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [playerName, setPlayerName] = useState("Player");
  const [showBackstoryModal, setShowBackstoryModal] = useState(false);
  const [currentAffection, setCurrentAffection] = useState(10);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Initialize chat hook
  const { messages, sendMessage, isSending, error: chatError, setInitialMessages } = useChat(
    tokenIdNumber || 0,
    playerName || "Player"
  );

  // Fetch character info when bonded
  const { characterInfo, isLoading: isLoadingCharacterInfo } = useCharacterInfo(
    tokenIdNumber,
    authToken,
    !!isBonded
  );

  // Update player name from backend when characterInfo loads
  useEffect(() => {
    if (characterInfo?.playerName) {
      setPlayerName(characterInfo.playerName);
    }
  }, [characterInfo?.playerName]);

  // Sync current affection with characterInfo
  useEffect(() => {
    if (characterInfo?.affectionLevel !== undefined) {
      setCurrentAffection(characterInfo.affectionLevel);
    }
  }, [characterInfo?.affectionLevel]);

  // Load initial messages from characterInfo when available
  useEffect(() => {
    if (characterInfo?.recentConversation && messages.length === 0) {
      setInitialMessages(characterInfo.recentConversation);
    }
  }, [characterInfo, messages.length, setInitialMessages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  // Handle sending message
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !authToken || isSending) return;

    const message = messageInput;
    setMessageInput(""); // Clear immediately for better UX

    try {
      const response = await sendMessage(message, authToken);

      // If affection changed, update immediately
      if (response?.affectionChange !== undefined && response.affectionChange !== 0) {
        setCurrentAffection(prev => Math.max(0, Math.min(1000, prev + response.affectionChange)));
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      // Restore message on error
      setMessageInput(message);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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

            {/* Character Info - Only show if bonded */}
            {isBonded && characterInfo && (
              <>
                {/* Affection Level */}
                <div className="mb-4">
                  <h3 className="font-semibold text-sm mb-2 text-red-500">Affection</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-pink-500 to-red-500 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(100, (currentAffection / 100) * 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium">{currentAffection}</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {characterInfo.totalMessages} messages
                  </p>
                </div>

                {/* Backstory - Clickable */}
                <div className="mb-4">
                  <h3 className="font-semibold text-sm mb-2 text-blue-500">Backstory</h3>
                  <button
                    onClick={() => setShowBackstoryModal(true)}
                    className="w-full px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg
                             hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all text-xs text-left"
                  >
                    Click to read {name}&apos;s story
                  </button>
                </div>
              </>
            )}

            {/* Loading state */}
            {isBonded && isLoadingCharacterInfo && (
              <div className="mb-4 text-center">
                <div className="inline-block w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Loading info...</p>
              </div>
            )}

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
          <div className="lg:col-span-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg flex flex-col h-[calc(100vh-12rem)]">
            {/* Chat Header */}
            <div className="border-b border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-xl font-bold">💬 Chat with {name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AI-powered conversation
              </p>
            </div>

            {/* Content Area - Changes based on bonding status */}
            {!isBonded ? (
              // Not bonded - Show bonding interface (full screen, no chat UI)
              <div className="flex items-center justify-center min-h-[600px] p-6">
                {showInitModal && tokenIdNumber !== null && !isNaN(tokenIdNumber) ? (
                  <CharacterInitModal
                    tokenId={tokenIdNumber}
                    characterName={name}
                    authToken={authToken}
                    onClose={() => setShowInitModal(false)}
                  />
                ) : (
                  <div className="text-center max-w-md">
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
                  </div>
                )}
              </div>
            ) : (
              // Bonded - Show chat interface
              <>
                {/* Chat Messages Area */}
                <div className="flex-1 p-6 overflow-y-auto relative">
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center text-gray-400">
                          <div className="text-4xl mb-2">💬</div>
                          <p>Start a conversation with {name}!</p>
                        </div>
                      </div>
                    ) : (
                      messages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex ${msg.sender === 'player' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] px-4 py-2 rounded-lg ${
                              msg.sender === 'player'
                                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs opacity-70">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {msg.affectionChange !== undefined && msg.affectionChange !== 0 && (
                                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                                  msg.affectionChange > 0
                                    ? 'bg-pink-200 dark:bg-pink-800 text-pink-900 dark:text-pink-100'
                                    : 'bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-gray-100'
                                }`}>
                                  {msg.affectionChange > 0 ? '+' : ''}{msg.affectionChange} {msg.affectionChange > 0 ? '❤️' : '💔'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Error display */}
                  {chatError && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg mt-4">
                      {chatError}
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={`Message ${name}...`}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                               bg-white dark:bg-gray-700 focus:ring-2 focus:ring-pink-500"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim() || isSending}
                      className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg
                               hover:from-pink-600 hover:to-purple-600 transition-all
                               disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed
                               flex items-center gap-2"
                    >
                      {isSending ? (
                        <>
                          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          Sending...
                        </>
                      ) : (
                        "Send"
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Backstory Modal */}
      {showBackstoryModal && characterInfo && (
        <BackstoryModal
          characterName={name}
          backstory={characterInfo.backstory}
          onClose={() => setShowBackstoryModal(false)}
        />
      )}
    </main>
  );
}
