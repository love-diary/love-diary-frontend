/**
 * POST /api/chat/send
 * Send a message to a character agent
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { sendMessageToAgent, withRetry } from '@/lib/agent-proxy';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import { CHARACTER_NFT_ADDRESS, CHARACTER_NFT_ABI } from '@/lib/contracts';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tokenId, message, playerName } = body;

    // Validate input
    if (tokenId === undefined || tokenId === null || !message || !playerName) {
      return NextResponse.json(
        { error: 'Missing required fields: tokenId, message, playerName' },
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

    // Call agent service to send message
    console.log(`💬 Sending message to character ${tokenId}`);

    const result = await withRetry(
      () =>
        sendMessageToAgent(tokenId, auth.walletAddress!, {
          message,
          playerName,
          timestamp: Math.floor(Date.now() / 1000),
        }),
      2, // max 2 retries
      1000 // 1 second delay
    );

    console.log(`✅ Message sent successfully to character ${tokenId}`);
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('❌ Chat send error:', error);

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
    if (serviceError.statusCode === 404) {
      return NextResponse.json(
        { error: 'Agent not initialized. Please bond character first.' },
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
        error: 'Failed to send message',
        details: errorMessage,
        statusCode,
      },
      { status: statusCode }
    );
  }
}
