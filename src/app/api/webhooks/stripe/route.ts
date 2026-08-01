import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/db';
import { subscriptions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Menggunakan switch-case agar lebih rapi dan scalable
  switch (event.type) {
    // 1. Handle Event Checkout Selesai (Langganan Baru)
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;

      if (userId && session.subscription && session.customer) {
        const subscriptionId =
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription.id;

        const customerId =
          typeof session.customer === 'string'
            ? session.customer
            : session.customer.id;

        // Simpan / Update data langganan di DB Neon
        await db
          .insert(subscriptions)
          .values({
            userId,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            stripePriceId: process.env.STRIPE_PRICE_ID!,
            status: 'active',
          })
          .onConflictDoUpdate({
            target: subscriptions.userId,
            set: {
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
              status: 'active',
            },
          });

        console.log(`✅ Langganan baru tersimpan di DB untuk User: ${userId}`);
      }
      break;
    }

    // 2. Handle Event Perubahan Status (Misal: User klik Cancel / Perpanjangan)
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;

      await db
        .update(subscriptions)
        .set({
          status: subscription.status, // Otomatis terupdate misal 'active', 'canceled', 'past_due', dll.
        })
        .where(eq(subscriptions.stripeSubscriptionId, subscription.id));

      console.log(`🔄 Status langganan ${subscription.id} diperbarui menjadi: ${subscription.status}`);
      break;
    }

    // 3. Handle Event Langganan Resmi Dihapus/Mati
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;

      await db
        .update(subscriptions)
        .set({
          status: 'canceled',
        })
        .where(eq(subscriptions.stripeSubscriptionId, subscription.id));

      console.log(`🛑 Langganan ${subscription.id} resmi CANCELED di DB`);
      break;
    }

    default:
      console.log(`ℹ️ Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}