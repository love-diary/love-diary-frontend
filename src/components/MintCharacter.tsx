"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatEther } from "viem";
import { useWalletClient } from "wagmi";
import Link from "next/link";
import {
  LOVE_TOKEN_ADDRESS,
  CHARACTER_NFT_ADDRESS,
  LOVE_TOKEN_ABI,
  CHARACTER_NFT_ABI,
  Gender,
  SexualOrientation,
  Language,
} from "@/lib/contracts";

export function MintCharacter() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [characterName, setCharacterName] = useState("");
  const [gender, setGender] = useState<number>(Gender.Female);
  const [sexualOrientation, setSexualOrientation] = useState<number>(SexualOrientation.Straight);
  const [isApproving, setIsApproving] = useState(false);
  const [tokenAdded, setTokenAdded] = useState(false);

  // Read LOVE balance
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: LOVE_TOKEN_ADDRESS,
    abi: LOVE_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  // Read allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: LOVE_TOKEN_ADDRESS,
    abi: LOVE_TOKEN_ABI,
    functionName: "allowance",
    args: address && CHARACTER_NFT_ADDRESS ? [address, CHARACTER_NFT_ADDRESS] : undefined,
  });

  // Read mint cost
  const { data: mintCost } = useReadContract({
    address: CHARACTER_NFT_ADDRESS,
    abi: CHARACTER_NFT_ABI,
    functionName: "MINT_COST",
  });

  // Read user's NFT balance
  const { data: nftBalance, refetch: refetchNftBalance } = useReadContract({
    address: CHARACTER_NFT_ADDRESS,
    abi: CHARACTER_NFT_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  // Approve contract
  const {
    writeContract: approveContract,
    data: approveHash,
    isPending: isApprovePending,
  } = useWriteContract();

  const {
    isLoading: isApproveConfirming,
    isSuccess: isApproveSuccess
  } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  // Mint NFT
  const {
    writeContract: mintContract,
    data: mintHash,
    isPending: isMintPending,
    error: mintError,
  } = useWriteContract();

  const {
    isLoading: isMintConfirming,
    isSuccess: isMintSuccess,
    isError: isMintError,
    error: mintReceiptError
  } = useWaitForTransactionReceipt({
    hash: mintHash,
  });

  // Log state changes
  useEffect(() => {
    console.log("=== STATE UPDATE ===");
    console.log("isApprovePending:", isApprovePending);
    console.log("isApproveConfirming:", isApproveConfirming);
    console.log("isApproveSuccess:", isApproveSuccess);
    console.log("approveHash:", approveHash);
    console.log("isMintPending:", isMintPending);
    console.log("isMintConfirming:", isMintConfirming);
    console.log("isMintSuccess:", isMintSuccess);
    console.log("isMintError:", isMintError);
    console.log("mintHash:", mintHash);
    console.log("mintError:", mintError);
    console.log("mintReceiptError:", mintReceiptError);
  }, [isApprovePending, isApproveConfirming, isApproveSuccess, approveHash, isMintPending, isMintConfirming, isMintSuccess, isMintError, mintHash, mintError, mintReceiptError]);

  // Log contract reads
  useEffect(() => {
    console.log("=== CONTRACT DATA ===");
    console.log("balance:", balance?.toString());
    console.log("allowance:", allowance?.toString());
    console.log("mintCost:", mintCost?.toString());
    console.log("nftBalance:", nftBalance?.toString());
  }, [balance, allowance, mintCost, nftBalance]);

  // Refetch balances when mint succeeds
  useEffect(() => {
    if (isMintSuccess) {
      console.log("=== MINT SUCCESS - REFRESHING DATA ===");
      // Wait a bit for blockchain to update, then refetch
      setTimeout(() => {
        refetchBalance();
        refetchNftBalance();
        refetchAllowance();
        console.log("Data refetch triggered");
      }, 2000);
    }
  }, [isMintSuccess, refetchBalance, refetchNftBalance, refetchAllowance]);

  // Auto-mint after approval succeeds
  useEffect(() => {
    if (isApproveSuccess && characterName.trim()) {
      console.log("=== APPROVE SUCCESS - AUTO-MINTING ===");
      // Wait a bit for blockchain state to update, then auto-mint
      setTimeout(() => {
        refetchAllowance();
        console.log("Allowance refetched, starting mint...");

        // Auto-trigger mint
        handleMint();
      }, 2000);
    }
  }, [isApproveSuccess]); // Only depend on isApproveSuccess to avoid infinite loops

  const handleApprove = async () => {
    console.log("=== APPROVE STARTED ===");
    console.log("isConnected:", isConnected);
    console.log("mintCost:", mintCost?.toString());
    console.log("LOVE_TOKEN_ADDRESS:", LOVE_TOKEN_ADDRESS);
    console.log("CHARACTER_NFT_ADDRESS:", CHARACTER_NFT_ADDRESS);

    if (!isConnected || !mintCost) {
      console.log("Approve aborted: not connected or no mint cost");
      return;
    }

    setIsApproving(true);
    try {
      console.log("Calling approveContract...");
      approveContract({
        address: LOVE_TOKEN_ADDRESS,
        abi: LOVE_TOKEN_ABI,
        functionName: "approve",
        args: [CHARACTER_NFT_ADDRESS, mintCost], // Approve only the mint cost (100 LOVE)
      });
      console.log("approveContract called successfully");
    } catch (error) {
      console.error("Approve error:", error);
    } finally {
      setIsApproving(false);
      console.log("=== APPROVE FINISHED ===");
    }
  };

  const handleMint = async () => {
    console.log("=== MINT STARTED ===");
    console.log("isConnected:", isConnected);
    console.log("characterName:", characterName);
    console.log("gender:", gender);
    console.log("sexualOrientation:", sexualOrientation);
    console.log("language:", Language.EN);
    console.log("CHARACTER_NFT_ADDRESS:", CHARACTER_NFT_ADDRESS);

    if (!isConnected || !characterName.trim()) {
      console.log("Mint aborted: not connected or no character name");
      return;
    }

    try {
      console.log("Calling mintContract...");
      mintContract({
        address: CHARACTER_NFT_ADDRESS,
        abi: CHARACTER_NFT_ABI,
        functionName: "mint",
        args: [characterName.trim(), gender, sexualOrientation, Language.EN],
      });
      console.log("mintContract called successfully");
    } catch (error) {
      console.error("Mint error:", error);
    }
    console.log("=== MINT FINISHED ===");
  };

  const addTokenToWallet = async () => {
    if (!walletClient) return;

    try {
      const success = await walletClient.watchAsset({
        type: 'ERC20',
        options: {
          address: LOVE_TOKEN_ADDRESS,
          symbol: 'LOVE',
          decimals: 18,
        },
      });
      if (success) {
        setTokenAdded(true);
      }
    } catch (error) {
      console.error("Error adding token:", error);
    }
  };

  const needsApproval = !allowance || (mintCost && allowance < mintCost);
  const hasEnoughBalance = balance && mintCost && balance >= mintCost;
  const canMint = isConnected && hasEnoughBalance && !needsApproval && characterName.trim().length > 0;

  if (!isConnected) {
    return (
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="text-4xl mb-4">🎭</div>
          <h2 className="text-2xl font-bold mb-2">Mint Your Character</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please connect your wallet to mint a character NFT
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
      <div className="text-center mb-6">
        <div className="text-4xl mb-4">🎭</div>
        <h2 className="text-2xl font-bold mb-2">Mint Your Character</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Create your unique AI-powered character NFT
        </p>
      </div>

      {/* Stats */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Your LOVE Balance:</span>
          <span className="font-semibold">{balance ? formatEther(balance) : "0"} LOVE</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Mint Cost:</span>
          <span className="font-semibold">{mintCost ? formatEther(mintCost) : "100"} LOVE</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Your Characters:</span>
          <span className="font-semibold">{nftBalance?.toString() || "0"} NFTs</span>
        </div>
        <button
          onClick={addTokenToWallet}
          disabled={tokenAdded}
          className={`w-full mt-2 text-sm font-medium transition ${
            tokenAdded
              ? "text-green-600 dark:text-green-400 cursor-default"
              : "text-pink-500 hover:text-pink-600"
          }`}
        >
          {tokenAdded ? "✓ LOVE token added to wallet" : "+ Add LOVE token to wallet"}
        </button>
      </div>

      {/* Character Name Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Character Name</label>
        <input
          type="text"
          value={characterName}
          onChange={(e) => setCharacterName(e.target.value)}
          placeholder="Enter character name..."
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                   focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          maxLength={32}
        />
      </div>

      {/* Gender Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Gender</label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setGender(Gender.Male)}
            className={`px-4 py-2 rounded-lg border transition ${
              gender === Gender.Male
                ? "bg-pink-500 text-white border-pink-500"
                : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
            }`}
          >
            Male
          </button>
          <button
            onClick={() => setGender(Gender.Female)}
            className={`px-4 py-2 rounded-lg border transition ${
              gender === Gender.Female
                ? "bg-pink-500 text-white border-pink-500"
                : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
            }`}
          >
            Female
          </button>
          <button
            onClick={() => setGender(Gender.NonBinary)}
            className={`px-4 py-2 rounded-lg border transition ${
              gender === Gender.NonBinary
                ? "bg-pink-500 text-white border-pink-500"
                : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
            }`}
          >
            Non-Binary
          </button>
        </div>
      </div>

      {/* Sexual Orientation Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Sexual Orientation</label>
        <select
          value={sexualOrientation}
          onChange={(e) => setSexualOrientation(Number(e.target.value))}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                   focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        >
          <option value={SexualOrientation.Straight}>Straight</option>
          <option value={SexualOrientation.SameGender}>Same Gender</option>
          <option value={SexualOrientation.Bisexual}>Bisexual</option>
          <option value={SexualOrientation.Pansexual}>Pansexual</option>
          <option value={SexualOrientation.Asexual}>Asexual</option>
        </select>
      </div>

      {/* Mint Button - Single Step (Auto-approves if needed) */}
      {!hasEnoughBalance ? (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-yellow-800 dark:text-yellow-200 text-sm">
            Insufficient LOVE tokens. You need {mintCost ? formatEther(mintCost) : "100"} LOVE to mint.
            <br />
            <Link href="/" className="underline font-semibold">
              Claim from faucet
            </Link>
          </p>
        </div>
      ) : (
        <>
          {!tokenAdded && needsApproval && (
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                💡 <strong>Tip:</strong> Add LOVE token to your wallet first (button above) so MetaMask can display &quot;100 LOVE&quot; instead of the contract address when approving.
              </p>
            </div>
          )}

          {isApproveSuccess && !isMintPending && !isMintConfirming && !isMintSuccess && (
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                ⏳ Approval successful! Starting mint transaction...
              </p>
            </div>
          )}

          <button
            onClick={needsApproval ? handleApprove : handleMint}
            disabled={
              !isConnected ||
              !characterName.trim() ||
              isApproving ||
              isApprovePending ||
              isApproveConfirming ||
              isMintPending ||
              isMintConfirming
            }
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600
                     disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            {isApprovePending || isApproveConfirming
              ? "Approving 100 LOVE..."
              : isMintPending || isMintConfirming
              ? "Minting Character..."
              : "Mint Character (100 LOVE)"}
          </button>
        </>
      )}

      {/* Success Message */}
      {isMintSuccess && (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-green-800 dark:text-green-200 font-semibold">
            🎉 Character minted successfully!
          </p>
          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
            Your character has been created. Check your wallet for the NFT!
          </p>
        </div>
      )}

      {/* Error Message */}
      {(mintError || (isMintError && mintReceiptError)) && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200 font-semibold mb-2">
            ❌ Transaction Failed
          </p>
          <p className="text-red-800 dark:text-red-200 text-sm">
            {mintError ? mintError.message : mintReceiptError?.message}
          </p>
          {mintHash && (
            <p className="text-red-700 dark:text-red-300 text-xs mt-2">
              <a
                href={`https://sepolia.basescan.org/tx/${mintHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                View on BaseScan →
              </a>
            </p>
          )}
        </div>
      )}

      {/* Info */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-blue-800 dark:text-blue-200 text-sm">
          ℹ️ Random traits (birth year, occupation, personality) will be generated on-chain when you mint.
        </p>
      </div>
    </div>
  );
}
