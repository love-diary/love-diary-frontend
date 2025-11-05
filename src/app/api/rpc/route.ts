/**
 * RPC Proxy - Forwards blockchain RPC requests to keep API keys server-side
 * This prevents exposing Alchemy/Infura API keys to the frontend
 */

import { NextRequest, NextResponse } from 'next/server';

const BASE_RPC_URL = process.env.BASE_RPC_URL || 'https://mainnet.base.org';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Forward the RPC request to the actual RPC endpoint
    const response = await fetch(BASE_RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    // Return the RPC response
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Cache-Control': 'public, s-maxage=2, stale-while-revalidate=10',
      },
    });
  } catch (error) {
    console.error('RPC proxy error:', error);
    return NextResponse.json(
      { error: 'RPC request failed' },
      { status: 500 }
    );
  }
}
