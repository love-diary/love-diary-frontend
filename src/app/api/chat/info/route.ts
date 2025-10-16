/**
 * GET /api/chat/info
 * Get character information (affection level, backstory, recent conversation)
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { getCharacterInfo, withRetry } from '@/lib/agent-proxy';
import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';
import { CHARACTER_NFT_ADDRESS, CHARACTER_NFT_ABI } from '@/lib/contracts';

export async function GET(request: NextRequest) {
  // Get tokenId from query params
  const { searchParams } = new URL(request.url);
  const tokenIdStr = searchParams.get('tokenId');

  if (!tokenIdStr) {
    return NextResponse.json(
      { error: 'Missing required parameter: tokenId' },
      { status: 400 }
    );
  }

  const tokenId = Number(tokenIdStr);

  try {

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

    // Call agent service to get character info
    console.log(`📊 Fetching character info for ${tokenId}`);

    const result = await withRetry(
      () => getCharacterInfo(tokenId, auth.walletAddress!),
      2, // max 2 retries
      1000 // 1 second delay
    );

    console.log(`✅ Character info retrieved for ${tokenId}`);
    return NextResponse.json(result);
  } catch (error: unknown) {
    // Type guard for error with statusCode and message
    const isServiceError = (err: unknown): err is { statusCode?: number; message?: string; details?: unknown } => {
      return typeof err === 'object' && err !== null;
    };

    const serviceError = isServiceError(error) ? error : {};
    const statusCode = serviceError.statusCode || 500;
    const errorMessage = serviceError.message || 'Unknown error';

    // Handle specific errors
    if (serviceError.statusCode === 404) {
      // 404 is expected for characters that haven't been bonded yet - don't log as error
      console.log(`ℹ️  Character ${tokenId} not initialized yet`);
      return NextResponse.json(
        { error: 'Character not initialized. Please bond character first.' },
        { status: 404 }
      );
    }

    // Only log non-404 errors
    console.error('❌ Character info fetch error:', error);

    // Log detailed error information
    if (serviceError.statusCode) {
      console.error(`   Status code: ${serviceError.statusCode}`);
    }
    if (serviceError.details) {
      console.error(`   Details:`, serviceError.details);
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
        error: 'Failed to fetch character info',
        details: errorMessage,
        statusCode,
      },
      { status: statusCode }
    );
  }
}
