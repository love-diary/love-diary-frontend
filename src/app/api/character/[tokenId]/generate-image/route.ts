/**
 * POST /api/character/[tokenId]/generate-image
 * Generate character portrait image (called after minting)
 * Fire-and-forget - frontend doesn't wait for result
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateCharacterImage } from '@/lib/agent-proxy';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  const { tokenId: tokenIdStr } = await params;
  const tokenId = parseInt(tokenIdStr);

  if (isNaN(tokenId)) {
    return NextResponse.json(
      { error: 'Invalid token ID' },
      { status: 400 }
    );
  }

  console.log(`🎨 Starting image generation for character ${tokenId}`);

  // On Vercel, we need to await the call or it gets killed when function exits
  // The agent service handles it in background, so this returns quickly
  try {
    await generateCharacterImage(tokenId);
    console.log(`✅ Image generation request sent for character ${tokenId}`);
  } catch (error) {
    console.error(`❌ Image generation failed for character ${tokenId}:`, error);
    // Don't throw - image is optional
  }

  return NextResponse.json({
    success: true,
    message: 'Image generation started'
  });
}
