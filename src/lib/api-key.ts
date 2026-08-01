import { createHash, randomBytes } from 'crypto';

/**
 * Membuat API Key baru dengan format `sk_live_<random_hex>`
 */
export function generateApiKey(): { rawKey: string; keyPrefix: string; keyHash: string } {
  // Generate 24 random bytes -> 48 hex characters
  const randomHex = randomBytes(24).toString('hex');
  const rawKey = `sk_live_${randomHex}`;
  
  // Prefix untuk UI Preview (misal: "sk_live_a1b2c3d4...")
  const keyPrefix = `${rawKey.slice(0, 12)}...`;
  
  // Hash SHA-256 dari rawKey untuk disimpan di DB
  const keyHash = hashApiKey(rawKey);

  return { rawKey, keyPrefix, keyHash };
}

/**
 * Mengubah API Key mentah menjadi SHA-256 Hash string
 */
export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}