/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Authentication utilities for Love Diary
 * Handles SIWE (Sign-In with Ethereum) and JWT token management
 */

import { SignJWT, jwtVerify } from 'jose';
import { SiweMessage } from 'siwe';
import { getRedisClient } from './redis';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

const JWT_EXPIRY = 30 * 24 * 60 * 60; // 30 days in seconds

export interface JWTPayload {
  walletAddress: string;
  iat: number;
  exp: number;
}

/**
 * Generate a random nonce for SIWE
 */
export function generateNonce(): string {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
}

/**
 * Store nonce in Redis with 10-minute TTL
 */
export async function storeNonce(nonce: string): Promise<void> {
  const redis = await getRedisClient();
  await redis.setEx(`nonce:${nonce}`, 600, 'pending'); // 10 minutes
}

/**
 * Verify and consume nonce (one-time use)
 */
export async function verifyAndConsumeNonce(nonce: string): Promise<boolean> {
  const redis = await getRedisClient();
  const exists = await redis.get(`nonce:${nonce}`);
  if (!exists) {
    return false;
  }

  // Mark as used
  await redis.set(`nonce:${nonce}`, 'used');
  return true;
}

/**
 * Verify SIWE message and signature
 */
export async function verifySiweMessage(
  message: string,
  signature: string
): Promise<{ valid: boolean; address?: string; error?: string }> {
  try {
    const siweMessage = new SiweMessage(message);

    // Verify signature
    const fields = await siweMessage.verify({ signature });

    if (!fields.success) {
      return { valid: false, error: 'Invalid signature' };
    }

    // Verify nonce
    const nonceValid = await verifyAndConsumeNonce(siweMessage.nonce);
    if (!nonceValid) {
      return { valid: false, error: 'Invalid or expired nonce' };
    }

    // Verify timestamp (not too old)
    const issuedAt = new Date(siweMessage.issuedAt!);
    const now = new Date();
    const ageMinutes = (now.getTime() - issuedAt.getTime()) / 1000 / 60;

    if (ageMinutes > 10) {
      return { valid: false, error: 'Message too old' };
    }

    return {
      valid: true,
      address: siweMessage.address,
    };
  } catch (error: any) {
    return {
      valid: false,
      error: error.message || 'Verification failed',
    };
  }
}

/**
 * Create JWT token for authenticated user
 */
export async function createJWT(walletAddress: string): Promise<string> {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + JWT_EXPIRY;

  const token = await new SignJWT({ walletAddress, iat, exp })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .sign(JWT_SECRET);

  // Store session in Redis
  const redis = await getRedisClient();
  await redis.setEx(`session:${token}`, JWT_EXPIRY, walletAddress);

  return token;
}

/**
 * Verify JWT token and return payload
 */
export async function verifyJWT(token: string): Promise<{ valid: boolean; payload?: JWTPayload; error?: string }> {
  try {
    // Check if token is in Redis (not invalidated)
    const redis = await getRedisClient();
    const sessionExists = await redis.exists(`session:${token}`);
    if (!sessionExists) {
      return { valid: false, error: 'Session expired or invalid' };
    }

    // Verify JWT signature and expiry
    const { payload } = await jwtVerify(token, JWT_SECRET);

    return {
      valid: true,
      payload: payload as JWTPayload,
    };
  } catch (error: any) {
    return {
      valid: false,
      error: error.message || 'Invalid token',
    };
  }
}

/**
 * Invalidate JWT token (logout)
 */
export async function invalidateJWT(token: string): Promise<void> {
  const redis = await getRedisClient();
  await redis.del(`session:${token}`);
}

/**
 * Extract JWT token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Verify NFT ownership with caching
 */
export async function verifyNFTOwnership(
  tokenId: number,
  walletAddress: string,
  nftContract: any // viem contract instance
): Promise<boolean> {
  const cacheKey = `nft:${tokenId}:owner`;
  const redis = await getRedisClient();

  // Try cache first (1 hour TTL)
  const cached = await redis.get(cacheKey);
  if (cached) {
    return cached.toLowerCase() === walletAddress.toLowerCase();
  }

  // Cache miss - query blockchain
  try {
    const owner = await nftContract.read.ownerOf([BigInt(tokenId)]) as string;

    // Cache for 1 hour
    await redis.setEx(cacheKey, 3600, owner);

    return owner.toLowerCase() === walletAddress.toLowerCase();
  } catch (error) {
    console.error('Failed to verify NFT ownership:', error);
    return false;
  }
}

/**
 * Middleware helper for API routes
 */
export async function authenticateRequest(
  authHeader: string | null,
  tokenId?: number,
  nftContract?: any
): Promise<{ authenticated: boolean; walletAddress?: string; error?: string }> {
  // Extract token
  const token = extractTokenFromHeader(authHeader);
  if (!token) {
    return { authenticated: false, error: 'Missing authorization token' };
  }

  // Verify JWT
  const { valid, payload, error } = await verifyJWT(token);
  if (!valid || !payload) {
    return { authenticated: false, error: error || 'Invalid token' };
  }

  // If tokenId provided, verify NFT ownership
  if (tokenId !== undefined && nftContract) {
    const ownsNFT = await verifyNFTOwnership(tokenId, payload.walletAddress, nftContract);
    if (!ownsNFT) {
      return { authenticated: false, error: 'You do not own this character' };
    }
  }

  return {
    authenticated: true,
    walletAddress: payload.walletAddress,
  };
}
