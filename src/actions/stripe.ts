// src/actions/stripe.ts
'use server';

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { stripe } from '@/lib/stripe';
import { db } from '@/db';
import { subscriptions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getDbUser } from '@/lib/auth-user';

// Helper untuk mengambil App URL secara aman
const getBaseUrl = () => {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    'https://usage-based-api-platform-saa-s-plat-tau.vercel.app'
  );
};

/**
 * 1. Action untuk membuat sesi Checkout / Langganan baru via Stripe
 */
export async function createCheckoutSessionAction() {
  const user = await getDbUser();
  if (!user) throw new Error('Unauthorized');

  const baseUrl = getBaseUrl();

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID!,
      },
    ],
    mode: 'subscription',
    success_url: `${baseUrl}/dashboard?success=true`,
    cancel_url: `${baseUrl}/dashboard?canceled=true`,
    customer_email: user.email,
    metadata: {
      userId: user.id,
    },
  });

  if (session.url) {
    redirect(session.url);
  }
}

/**
 * 2. Action untuk mengarahkan user ke Stripe Customer Portal (Kelola / Batal Langganan)
 */
export async function createCustomerPortalAction() {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  // Ambil stripeCustomerId pengguna dari database
  const userSub = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, userId),
  });

  // Jika belum berlangganan / tidak ada ID Stripe, langsung arahkan ke Checkout
  if (!userSub?.stripeCustomerId) {
    return createCheckoutSessionAction();
  }

  const baseUrl = getBaseUrl();

  // Buat sesi Portal Pelanggan Stripe
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: userSub.stripeCustomerId,
    return_url: `${baseUrl}/dashboard`,
  });

  // Redirect pengguna ke Customer Portal
  redirect(portalSession.url);
}