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

  console.log(`🎨 Starting background image generation for character ${tokenId}`);

  // Fire-and-forget: Start generation in background, return immediately
  generateCharacterImage(tokenId)
    .then(() => {
      console.log(`✅ Image generated successfully for character ${tokenId}`);
    })
    .catch((error) => {
      console.error(`❌ Image generation failed for character ${tokenId}:`, error);
      // Don't throw - image is optional
    });

  // Return immediately without waiting
  return NextResponse.json({
    success: true,
    message: 'Image generation started in background'
  });
}
