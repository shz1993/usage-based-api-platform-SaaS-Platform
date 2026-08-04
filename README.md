# 🚀 Usage-Based API SaaS Platform

**Usage-Based API SaaS Platform** is a modern, production-ready developer platform designed to issue API keys, enforce rate limiting, track API latency/usage analytics, and charge customers using Stripe metered billing.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-C5F740?style=for-the-badge&logo=drizzle&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Clerk](https://img.shields.io/badge/Clerk_Auth-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)
![Upstash](https://img.shields.io/badge/Upstash_Redis-00E599?style=for-the-badge&logo=redis&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-008CDD?style=for-the-badge&logo=stripe&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

---

## 🌐 Live Demo & Preview

Try the live application:  
👉 **[https://usage-based-api-platform-saa-s-plat-tau.vercel.app/](https://usage-based-api-platform-saa-s-plat-tau.vercel.app/)**

---

## ✨ Key Features

- 🔐 **Authentication & User Sync (`/`, Clerk)**: Secure multi-provider authentication powered by **Clerk**, automatically synchronized with Neon PostgreSQL.
- 🔑 **API Key Management (`/dashboard`)**: Securely generate, preview prefixes, hash (SHA-256), and revoke developer API keys.
- ⚡ **Rate Limiting Gateway**: High-performance sliding-window rate limiting (10 req / 10s) powered by **Upstash Redis**.
- 📊 **Real-Time Analytics & Monitoring (`/dashboard/analytics`)**: Interactive performance dashboard with Recharts displaying total requests, response latency (ms), and HTTP success rates.
- 💳 **Stripe Metered Billing**: Usage-based subscription integration using Stripe Checkout and Customer Portal for automated invoice management.
- 🔄 **Automated Webhooks**: Instant sync for subscription creation, updates, and cancellations via Stripe webhooks.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router & Server Actions)
- **Programming Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database & ORM**: [Neon PostgreSQL](https://neon.tech/) & [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [Clerk](https://clerk.com/) (`@clerk/nextjs`)
- **Rate Limiting & Cache**: [Upstash Redis](https://upstash.com/) (`@upstash/ratelimit`)
- **Billing & Payments**: [Stripe](https://stripe.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Deployment**: [Vercel](https://vercel.com/)

---

## 🚀 Local Setup Guide

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) (v18+) installed, along with accounts on [Clerk](https://clerk.com/), [Neon PostgreSQL](https://neon.tech/), [Upstash](https://upstash.com/), and [Stripe](https://stripe.com/).

### 2. Clone Repository
```bash
git clone [https://github.com/shz1993/usage-based-api-platform-SaaS-Platform.git](https://github.com/shz1993/usage-based-api-platform-SaaS-Platform.git)
cd usage-based-api-platform-SaaS-Platform
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env.local` file in the root directory and add your API credentials:

```env
# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Neon PostgreSQL Connection URL
DATABASE_URL="postgresql://neondb_owner:your_password@ep-sample-pooler.region.aws.neon.tech/neondb?sslmode=require"

# Clerk Authentication Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Clerk Redirect Routes
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"

# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL="[https://...upstash.io](https://...upstash.io)"
UPSTASH_REDIS_REST_TOKEN="AX..."

# Stripe Billing & Webhooks
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PRICE_ID="price_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### 5. Setup Drizzle Database Schema
Push your database schema to Neon PostgreSQL:

```bash
npx drizzle-kit push
```

The core schema definition (`src/db/schema.ts`) includes:

```typescript
import { pgTable, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';

// 1. Database Users (Synced from Clerk)
export const users = pgTable('users', {
  id: text('id').primaryKey(), // Matches Clerk user ID
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 2. API Keys Table
export const apiKeys = pgTable('api_keys', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  keyHash: text('key_hash').notNull().unique(),
  keyPrefix: text('key_prefix').notNull(),
  isRevoked: boolean('is_revoked').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 3. API Usage Logs Table
export const apiLogs = pgTable('api_logs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  apiKeyId: text('api_key_id').notNull().references(() => apiKeys.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  endpoint: text('endpoint').notNull(),
  statusCode: integer('status_code').notNull(),
  latencyMs: integer('latency_ms').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 4. Stripe Subscriptions Table
export const subscriptions = pgTable('subscriptions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  stripeCustomerId: text('stripe_customer_id').notNull(),
  stripeSubscriptionId: text('stripe_subscription_id').notNull(),
  stripePriceId: text('stripe_price_id').notNull(),
  status: text('status').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

### 6. Run Local Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to test the application locally.
