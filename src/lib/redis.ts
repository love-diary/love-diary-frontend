/**
 * Redis client singleton
 * Manages connection to Vercel Redis (Upstash)
 */

import { createClient, RedisClientType } from 'redis';

let client: RedisClientType | null = null;

export async function getRedisClient(): Promise<RedisClientType> {
  if (client && client.isOpen) {
    return client;
  }

  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    throw new Error('REDIS_URL environment variable is not set');
  }

  client = createClient({
    url: redisUrl,
  });

  client.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });

  await client.connect();

  return client;
}

/**
 * Close Redis connection (for cleanup)
 */
export async function closeRedisClient(): Promise<void> {
  if (client && client.isOpen) {
    await client.quit();
    client = null;
  }
}
