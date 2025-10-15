/**
 * POST /api/auth/signin
 * Sign-In with Ethereum (SIWE) authentication endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifySiweMessage, createJWT } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, signature, address } = body;

    // Validate input
    if (!message || !signature || !address) {
      return NextResponse.json(
        { error: 'Missing required fields: message, signature, address' },
        { status: 400 }
      );
    }

    // Verify SIWE message and signature
    const { valid, address: verifiedAddress, error } = await verifySiweMessage(
      message,
      signature
    );

    if (!valid || !verifiedAddress) {
      return NextResponse.json(
        { error: error || 'Invalid signature' },
        { status: 401 }
      );
    }

    // Ensure address matches
    if (verifiedAddress.toLowerCase() !== address.toLowerCase()) {
      return NextResponse.json(
        { error: 'Address mismatch' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = await createJWT(verifiedAddress);
    const expiresAt = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60); // 30 days

    return NextResponse.json({
      token,
      expiresAt,
      address: verifiedAddress,
    });
  } catch (error: unknown) {
    console.error('Signin error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Authentication failed', details: errorMessage },
      { status: 500 }
    );
  }
}
