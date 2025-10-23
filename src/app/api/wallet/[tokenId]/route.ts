/**
 * GET /api/wallet/[tokenId]
 * Get character wallet info (address and LOVE balance)
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { getCharacterWallet, verifyGift, withRetry } from '@/lib/agent-proxy';
import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';
import { CHARACTER_NFT_ADDRESS, CHARACTER_NFT_ABI } from '@/lib/contracts';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  try {
    const { tokenId: tokenIdParam } = await params;
    const tokenId = parseInt(tokenIdParam);

    if (isNaN(tokenId)) {
      return NextResponse.json(
        { error: 'Invalid tokenId' },
        { status: 400 }
      );
    }

    // Create viem client
    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(process.env.BASE_RPC_URL || 'https://sepolia.base.org'),
    });

    const nftContract = {
      address: CHARACTER_NFT_ADDRESS,
      abi: CHARACTER_NFT_ABI,
    };

    // Authenticate and verify NFT ownership
    const auth = await authenticateRequest(
      request.headers.get('Authorization'),
      tokenId,
      {
        read: {
          ownerOf: async ([id]: [bigint]) => {
            return await publicClient.readContract({
              ...nftContract,
              functionName: 'ownerOf',
              args: [id],
            });
          },
        },
      }
    );

    if (!auth.authenticated) {
      return NextResponse.json(
        { error: auth.error || 'Authentication failed' },
        { status: 401 }
      );
    }

    // Call agent service to get wallet info
    console.log(`💼 Fetching wallet info for character ${tokenId}`);

    const walletInfo = await withRetry(
      () => getCharacterWallet(tokenId, auth.walletAddress!),
      2, // max 2 retries
      1000 // 1 second delay
    );

    console.log(`✅ Wallet info retrieved: ${walletInfo.walletAddress}`);
    return NextResponse.json(walletInfo);
  } catch (error: unknown) {
    console.error('❌ Wallet info error:', error);

    // Type guard for error with statusCode and message
    const isServiceError = (err: unknown): err is { statusCode?: number; message?: string; details?: unknown } => {
      return typeof err === 'object' && err !== null;
    };

    const serviceError = isServiceError(error) ? error : {};
    const statusCode = serviceError.statusCode || 500;
    const errorMessage = serviceError.message || 'Unknown error';

    // Agent service connection error
    if (serviceError.statusCode === 503 || serviceError.statusCode === 504) {
      return NextResponse.json(
        {
          error: 'Agent service unavailable',
          details: errorMessage,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to retrieve wallet info',
        details: errorMessage,
        statusCode,
      },
      { status: statusCode }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  try {
    const { tokenId: tokenIdParam } = await params;
    const tokenId = parseInt(tokenIdParam);
    const body = await request.json();
    const { txHash, amount } = body;

    if (isNaN(tokenId)) {
      return NextResponse.json(
        { error: 'Invalid tokenId' },
        { status: 400 }
      );
    }

    if (!txHash || !amount) {
      return NextResponse.json(
        { error: 'Missing txHash or amount' },
        { status: 400 }
      );
    }

    // Create viem client
    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(process.env.BASE_RPC_URL || 'https://sepolia.base.org'),
    });

    const nftContract = {
      address: CHARACTER_NFT_ADDRESS,
      abi: CHARACTER_NFT_ABI,
    };

    // Authenticate and verify NFT ownership
    const auth = await authenticateRequest(
      request.headers.get('Authorization'),
      tokenId,
      {
        read: {
          ownerOf: async ([id]: [bigint]) => {
            return await publicClient.readContract({
              ...nftContract,
              functionName: 'ownerOf',
              args: [id],
            });
          },
        },
      }
    );

    if (!auth.authenticated) {
      return NextResponse.json(
        { error: auth.error || 'Authentication failed' },
        { status: 401 }
      );
    }

    // Call agent service to verify gift
    console.log(`🎁 Verifying gift for character ${tokenId}, tx: ${txHash}`);

    const giftResult = await withRetry(
      () => verifyGift(tokenId, auth.walletAddress!, txHash, amount),
      2, // max 2 retries
      1000 // 1 second delay
    );

    console.log(`✅ Gift verified: ${giftResult.status}`);
    return NextResponse.json(giftResult);
  } catch (error: unknown) {
    console.error('❌ Gift verification error:', error);

    // Type guard for error with statusCode and message
    const isServiceError = (err: unknown): err is { statusCode?: number; message?: string; details?: unknown } => {
      return typeof err === 'object' && err !== null;
    };

    const serviceError = isServiceError(error) ? error : {};
    const statusCode = serviceError.statusCode || 500;
    const errorMessage = serviceError.message || 'Unknown error';

    // Agent service connection error
    if (serviceError.statusCode === 503 || serviceError.statusCode === 504) {
      return NextResponse.json(
        {
          error: 'Agent service unavailable',
          details: errorMessage,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to verify gift',
        details: errorMessage,
        statusCode,
      },
      { status: statusCode }
    );
  }
}
