import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { apiKeys, apiLogs, subscriptions } from '@/db/schema';
import { hashApiKey } from '@/lib/api-key';
import { ratelimit } from '@/lib/redis';
import { stripe } from '@/lib/stripe';
import { eq, and } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const authHeader = req.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Missing or invalid Authorization header. Expected: Bearer sk_live_...' },
      { status: 401 }
    );
  }

  const rawKey = authHeader.replace('Bearer ', '').trim();
  const keyHash = hashApiKey(rawKey);

  const apiKey = await db.query.apiKeys.findFirst({
    where: and(eq(apiKeys.keyHash, keyHash), eq(apiKeys.isRevoked, false)),
  });

  if (!apiKey) {
    return NextResponse.json({ error: 'Invalid or revoked API Key' }, { status: 401 });
  }

  // Rate Limiting Check
  const { success, limit, remaining, reset } = await ratelimit.limit(apiKey.id);
  const latencyMs = Date.now() - startTime;

  if (!success) {
    await db.insert(apiLogs).values({
      apiKeyId: apiKey.id,
      userId: apiKey.userId,
      endpoint: '/api/v1/data',
      statusCode: 429,
      latencyMs,
    });

    return NextResponse.json(
      { error: 'Too Many Requests. Rate limit exceeded.' },
      { status: 429 }
    );
  }

  // Log Successful Request to Neon DB
  await db.insert(apiLogs).values({
    apiKeyId: apiKey.id,
    userId: apiKey.userId,
    endpoint: '/api/v1/data',
    statusCode: 200,
    latencyMs,
  });

  // 🚀 LAPORKAN PEMANGGILAN KE STRIPE METERED BILLING
  try {
    const userSub = await db.query.subscriptions.findFirst({
      where: and(eq(subscriptions.userId, apiKey.userId), eq(subscriptions.status, 'active')),
    });

    if (userSub?.stripeCustomerId) {
      await stripe.billing.meterEvents.create({
        eventName: 'api_requests',
        payload: {
          value: '1',
          stripe_customer_id: userSub.stripeCustomerId,
        },
      });
    }
  } catch (stripeErr) {
    console.error('Stripe Meter Event Error:', stripeErr);
    // Jangan hentikan respon API jika pelaporan Stripe gagal sementara
  }

  return NextResponse.json(
    {
      message: 'Access Granted! Usage recorded.',
      data: {
        timestamp: new Date().toISOString(),
        status: 'active',
      },
    },
    {
      status: 200,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': reset.toString(),
      },
    }
  );
}