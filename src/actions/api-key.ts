'use server';

import { getDbUser } from '@/lib/auth-user';
import { db } from '@/db';
import { apiKeys } from '@/db/schema';
import { generateApiKey } from '@/lib/api-key';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function createApiKeyAction(name: string) {
  const user = await getDbUser();
  if (!user) throw new Error('Unauthorized');

  if (!name.trim()) throw new Error('Key name is required');

  const { rawKey, keyPrefix, keyHash } = generateApiKey();

  await db.insert(apiKeys).values({
    userId: user.id,
    name,
    keyHash,
    keyPrefix,
  });

  revalidatePath('/dashboard');

  // Kembalikan rawKey agar bisa ditampilkan 1 KALI SAJA ke user di modal/UI
  return { rawKey, keyPrefix };
}

export async function revokeApiKeyAction(keyId: string) {
  const user = await getDbUser();
  if (!user) throw new Error('Unauthorized');

  await db
    .update(apiKeys)
    .set({ isRevoked: true })
    .where(and(eq(apiKeys.id, keyId), eq(apiKeys.userId, user.id)));

  revalidatePath('/dashboard');
}