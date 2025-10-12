"use client";

import { useAccount, useReadContract, usePublicClient } from "wagmi";
import { CHARACTER_NFT_ADDRESS, CHARACTER_NFT_ABI } from "@/lib/contracts";
import { getOccupationName, getPersonalityName, getGenderLabel } from "@/lib/character-traits";
import Link from "next/link";
import { useEffect, useState } from "react";

interface CharacterData {
  tokenId: number;
  name: string;
  gender: number;
  occupationId: number;
  personalityId: number;
  birthYear: number;
}

export function CharacterList() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const [ownedCharacters, setOwnedCharacters] = useState<CharacterData[]>([]);
  const [isFetchingCharacters, setIsFetchingCharacters] = useState(false);

  // Get total supply to know how many tokens to check
  const { data: totalSupply, isLoading: isLoadingSupply } = useReadContract({
    address: CHARACTER_NFT_ADDRESS,
    abi: CHARACTER_NFT_ABI,
    functionName: "totalSupply",
  });

  // Get user's NFT balance
  const { data: nftBalance, isLoading: isLoadingBalance } = useReadContract({
    address: CHARACTER_NFT_ADDRESS,
    abi: CHARACTER_NFT_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  const isLoading = isLoadingSupply || isLoadingBalance || isFetchingCharacters;

  useEffect(() => {
    async function fetchOwnedCharacters() {
      if (!address || !publicClient || !totalSupply || totalSupply === BigInt(0)) {
        setOwnedCharacters([]);
        setIsFetchingCharacters(false);
        return;
      }

      setIsFetchingCharacters(true);
      const owned: CharacterData[] = [];

      try {
        const totalCount = Number(totalSupply);

        // Loop through all tokens in the contract
        for (let tokenId = 0; tokenId < totalCount; tokenId++) {
          try {
            // Check who owns this token
            const owner = await publicClient.readContract({
              address: CHARACTER_NFT_ADDRESS,
              abi: CHARACTER_NFT_ABI,
              functionName: "ownerOf",
              args: [BigInt(tokenId)],
            });

            // If the connected wallet owns this token, fetch character data
            if (owner.toLowerCase() === address.toLowerCase()) {
              const character = await publicClient.readContract({
                address: CHARACTER_NFT_ADDRESS,
                abi: CHARACTER_NFT_ABI,
                functionName: "getCharacter",
                args: [BigInt(tokenId)],
              });

              owned.push({
                tokenId,
                name: character.name,
                gender: character.gender,
                occupationId: character.occupationId,
                personalityId: character.personalityId,
                birthYear: Number(character.birthYear),
              });
            }
          } catch (error) {
            console.error(`Error checking token ${tokenId}:`, error);
          }
        }

        setOwnedCharacters(owned);
      } catch (error) {
        console.error("Error fetching owned characters:", error);
      } finally {
        setIsFetchingCharacters(false);
      }
    }

    fetchOwnedCharacters();
  }, [address, publicClient, totalSupply]);

  if (!isConnected) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
        <div className="text-4xl mb-4">🎭</div>
        <h3 className="font-bold text-lg mb-2">Your Characters</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Connect your wallet to see your characters
        </p>
      </div>
    );
  }

  const characterCount = Number(nftBalance || 0);

  // Show loading state initially
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
        <div className="text-4xl mb-4">⏳</div>
        <h3 className="font-bold text-lg mb-2">Your Characters</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Loading your characters...
        </p>
      </div>
    );
  }

  if (characterCount === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
        <div className="text-4xl mb-4">🎭</div>
        <h3 className="font-bold text-lg mb-2">Your Characters</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          You don&apos;t have any characters yet
        </p>
        <Link
          href="/mint"
          className="inline-block bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600
                   text-white font-semibold py-2 px-6 rounded-lg transition"
        >
          Mint Your First Character
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">Your Characters ({characterCount})</h3>
        <Link
          href="/mint"
          className="text-sm text-pink-500 hover:text-pink-600 font-semibold"
        >
          + Mint Another
        </Link>
      </div>

      {isFetchingCharacters ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">⏳</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Loading character details...
          </p>
        </div>
      ) : ownedCharacters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ownedCharacters.map((character) => {
            const locale = "en";
            return (
              <Link
                key={character.tokenId}
                href={`/character/${character.tokenId}`}
                className="block bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-lg transition cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-lg">{character.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Token #{character.tokenId}
                    </p>
                  </div>
                  <div className="text-3xl">🎭</div>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Gender:</span>
                    <span className="font-medium">{getGenderLabel(character.gender, locale)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Occupation:</span>
                    <span className="font-medium">{getOccupationName(character.occupationId, locale)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Personality:</span>
                    <span className="font-medium">{getPersonalityName(character.personalityId, locale)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Birth Year:</span>
                    <span className="font-medium">{character.birthYear}</span>
                  </div>
                </div>
                <div className="mt-3 text-center text-xs text-pink-500 font-semibold">
                  View Details →
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-600 dark:text-gray-400">
          <p className="text-sm">
            No characters found. This might be a loading issue.{" "}
            <a
              href={`https://sepolia.basescan.org/token/${CHARACTER_NFT_ADDRESS}?a=${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-500 hover:underline"
            >
              Check on BaseScan
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
