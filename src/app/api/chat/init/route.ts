/**
 * POST /api/chat/init
 * Initialize first-time chat with a character
 * Creates agent and generates backstory
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { createAgent, withRetry } from '@/lib/agent-proxy';
import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';
import { CHARACTER_NFT_ADDRESS, CHARACTER_NFT_ABI } from '@/lib/contracts';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tokenId, playerName, playerGender } = body;

    // Validate input
    if (tokenId === undefined || tokenId === null || !playerName || !playerGender) {
      return NextResponse.json(
        { error: 'Missing required fields: tokenId, playerName, playerGender' },
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

    // Call real agent service to generate backstory
    console.log(`📝 Calling agent service to create agent for character ${tokenId}`);

    const result = await withRetry(
      () =>
        createAgent(tokenId, auth.walletAddress!, {
          playerName,
          playerGender,
        }),
      3, // max 3 retries
      2000 // 2 second delay
    );

    console.log(`✅ Agent created successfully for character ${tokenId}`);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('❌ Chat init error:', error);

    // Log detailed error information
    if (error.statusCode) {
      console.error(`   Status code: ${error.statusCode}`);
    }
    if (error.details) {
      console.error(`   Details:`, error.details);
    }

    // Handle specific errors
    if (error.statusCode === 409) {
      return NextResponse.json(
        { error: 'Agent already exists for this character' },
        { status: 409 }
      );
    }

    // Agent service connection error
    if (error.statusCode === 503 || error.statusCode === 504) {
      return NextResponse.json(
        {
          error: 'Agent service unavailable',
          details: error.message,
          hint: 'Make sure AGENT_SERVICE_URL is configured and the agent service is running',
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to initialize chat',
        details: error.message,
        statusCode: error.statusCode,
      },
      { status: error.statusCode || 500 }
    );
  }
}
