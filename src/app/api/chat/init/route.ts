/**
 * POST /api/chat/init
 * Initialize first-time chat with a character
 * Creates agent and generates backstory
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { createAgent, withRetry } from '@/lib/agent-proxy';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import { CHARACTER_NFT_ADDRESS, CHARACTER_NFT_ABI } from '@/lib/contracts';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tokenId, playerName, playerGender, playerTimezone } = body;

    // Validate input
    if (tokenId === undefined || tokenId === null || !playerName || !playerGender || playerTimezone === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: tokenId, playerName, playerGender, playerTimezone' },
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

    // Call real agent service to generate backstory
    console.log(`📝 Calling agent service to create agent for character ${tokenId}`);

    const result = await withRetry(
      () =>
        createAgent(tokenId, auth.walletAddress!, {
          playerName,
          playerGender,
          playerTimezone,
        }),
      3, // max 3 retries
      2000 // 2 second delay
    );

    console.log(`✅ Agent created successfully for character ${tokenId}`);
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('❌ Chat init error:', error);

    // Type guard for error with statusCode and message
    const isServiceError = (err: unknown): err is { statusCode?: number; message?: string; details?: unknown } => {
      return typeof err === 'object' && err !== null;
    };

    const serviceError = isServiceError(error) ? error : {};
    const statusCode = serviceError.statusCode || 500;
    const errorMessage = serviceError.message || 'Unknown error';

    // Log detailed error information
    if (serviceError.statusCode) {
      console.error(`   Status code: ${serviceError.statusCode}`);
    }
    if (serviceError.details) {
      console.error(`   Details:`, serviceError.details);
    }

    // Handle specific errors
    if (serviceError.statusCode === 409) {
      return NextResponse.json(
        { error: 'Agent already exists for this character' },
        { status: 409 }
      );
    }

    // Agent service connection error
    if (serviceError.statusCode === 503 || serviceError.statusCode === 504) {
      return NextResponse.json(
        {
          error: 'Agent service unavailable',
          details: errorMessage,
          hint: 'Make sure AGENT_SERVICE_URL is configured and the agent service is running',
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to initialize chat',
        details: errorMessage,
        statusCode,
      },
      { status: statusCode }
    );
  }
}
