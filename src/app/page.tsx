import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const { userId } = await auth();

  // Jika sudah login, langsung lempar ke /dashboard
  if (userId) {
    redirect('/dashboard');
  }

  // Jika belum login, lempar ke /sign-in
  redirect('/sign-in');
}