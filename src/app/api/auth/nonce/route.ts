/**
 * GET /api/auth/nonce
 * Generate a nonce for SIWE authentication
 */

import { NextResponse } from 'next/server';
import { generateNonce, storeNonce } from '@/lib/auth';

export async function GET() {
  try {
    const nonce = generateNonce();
    await storeNonce(nonce);

    return NextResponse.json({ nonce });
  } catch (error: any) {
    console.error('Nonce generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate nonce' },
      { status: 500 }
    );
  }
}
