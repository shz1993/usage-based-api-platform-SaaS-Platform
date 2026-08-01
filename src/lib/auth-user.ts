import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function getDbUser() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser || !clerkUser.emailAddresses[0]?.emailAddress) {
      return null;
    }

    const email = clerkUser.emailAddresses[0].emailAddress;
    const name =
      `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() ||
      email.split('@')[0];

    // 1. Cek apakah user sudah ada di DB Neon
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, clerkUser.id),
    });

    if (existingUser) {
      return existingUser;
    }

    // 2. Simpan user baru jika belum ada
    const [newUser] = await db
      .insert(users)
      .values({
        id: clerkUser.id,
        email,
        name,
      })
      .returning();

    return newUser;
  } catch (error) {
    console.error('Error in getDbUser:', error);
    return null;
  }
}