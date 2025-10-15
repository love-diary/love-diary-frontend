/**
 * POST /api/auth/logout
 * Invalidate JWT token
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromHeader, invalidateJWT } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const token = extractTokenFromHeader(request.headers.get('Authorization'));

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 400 }
      );
    }

    await invalidateJWT(token);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
