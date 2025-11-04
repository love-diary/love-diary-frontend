/**
 * GET /api/diary/[tokenId]/entry?date=YYYY-MM-DD
 * Get specific diary entry by date
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { getDiaryEntry, withRetry } from '@/lib/agent-proxy';
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
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (isNaN(tokenId)) {
      return NextResponse.json(
        { error: 'Invalid tokenId' },
        { status: 400 }
      );
    }

    if (!date) {
      return NextResponse.json(
        { error: 'Missing date parameter' },
        { status: 400 }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
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

    // Call agent service to get diary entry
    console.log(`📖 Fetching diary entry for character ${tokenId}, date ${date}`);

    const diaryEntry = await withRetry(
      () => getDiaryEntry(tokenId, auth.walletAddress!, date),
      2, // max 2 retries
      1000 // 1 second delay
    );

    console.log(`✅ Diary entry retrieved for ${date}`);
    return NextResponse.json(diaryEntry);
  } catch (error: unknown) {
    console.error('❌ Diary entry error:', error);

    // Type guard for error with statusCode and message
    const isServiceError = (err: unknown): err is { statusCode?: number; message?: string; details?: unknown } => {
      return typeof err === 'object' && err !== null;
    };

    const serviceError = isServiceError(error) ? error : {};
    const statusCode = serviceError.statusCode || 500;
    const errorMessage = serviceError.message || 'Unknown error';

    // Handle 404 (diary not found)
    if (serviceError.statusCode === 404) {
      return NextResponse.json(
        { error: 'Diary entry not found' },
        { status: 404 }
      );
    }

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
        error: 'Failed to retrieve diary entry',
        details: errorMessage,
        statusCode,
      },
      { status: statusCode }
    );
  }
}
