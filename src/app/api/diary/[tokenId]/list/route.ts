/**
 * GET /api/diary/[tokenId]/list
 * Get list of diary entries for a character
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { getDiaryList, withRetry } from '@/lib/agent-proxy';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
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
      chain: base,
      transport: http(process.env.BASE_RPC_URL || 'https://mainnet.base.org'),
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

    // Call agent service to get diary list
    console.log(`📖 Fetching diary list for character ${tokenId}`);

    const diaryList = await withRetry(
      () => getDiaryList(tokenId, auth.walletAddress!),
      2, // max 2 retries
      1000 // 1 second delay
    );

    console.log(`✅ Diary list retrieved: ${diaryList.length} entries`);
    return NextResponse.json(diaryList);
  } catch (error: unknown) {
    console.error('❌ Diary list error:', error);

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
        error: 'Failed to retrieve diary list',
        details: errorMessage,
        statusCode,
      },
      { status: statusCode }
    );
  }
}
