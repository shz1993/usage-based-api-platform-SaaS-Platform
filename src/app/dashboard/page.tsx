// src/app/dashboard/page.tsx
import { getDbUser } from '@/lib/auth-user';
import { db } from '@/db';
import { apiKeys, apiLogs } from '@/db/schema';
import { eq, desc, count } from 'drizzle-orm';
import { UserButton } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ApiKeyManager } from '@/components/api-key-manager';
import {
  Activity,
  KeyRound,
  CheckCircle2,
  CreditCard,
  Receipt,
  BarChart3,
  Zap,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import {
  createCheckoutSessionAction,
  createCustomerPortalAction,
} from '@/actions/stripe';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const dbUser = await getDbUser();

  if (!dbUser) {
    redirect('/sign-in');
  }

  // Fetch API keys for the current user
  const keys = await db.query.apiKeys.findMany({
    where: eq(apiKeys.userId, dbUser.id),
    orderBy: [desc(apiKeys.createdAt)],
  });

  // Fetch API usage log counts
  const totalLogs = await db
    .select({ value: count() })
    .from(apiLogs)
    .where(eq(apiLogs.userId, dbUser.id));

  const totalRequests = totalLogs[0]?.value || 0;
  const activeKeysCount = keys.filter((k) => !k.isRevoked).length;

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 font-sans antialiased pb-16">
      {/* 🟢 TOP NAVBAR */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Identity & Status */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm font-bold text-xs tracking-wider">
              API
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-slate-900">Developer Portal</h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Live Sandbox
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Welcome back, <span className="font-medium text-slate-700">{dbUser.name}</span>
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
            {/* Analytics Navigation */}
            <Link
              href="/dashboard/analytics"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-lg border border-slate-200 shadow-sm transition-all duration-150 hover:border-slate-300"
            >
              <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
              <span>Analytics</span>
            </Link>

            {/* Customer Portal */}
            <form action={createCustomerPortalAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-lg border border-slate-200 shadow-sm transition-all duration-150 hover:border-slate-300"
              >
                <Receipt className="w-3.5 h-3.5 text-slate-500" />
                <span>Billing & Invoices</span>
              </button>
            </form>

            {/* Subscribe Plan */}
            <form action={createCheckoutSessionAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg shadow-sm transition-all duration-150 hover:scale-[1.01] active:scale-[0.99]"
              >
                <CreditCard className="w-3.5 h-3.5 text-indigo-200" />
                <span>Upgrade Plan</span>
              </button>
            </form>

            <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'w-8 h-8 rounded-lg shadow-sm border border-slate-200',
                },
              }}
            />
          </div>
        </div>
      </header>

      {/* 🚀 MAIN CONTENT CONTAINER */}
      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Overview
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Monitor your API credentials, traffic activity, and rate limit configurations.
            </p>
          </div>

          {/* System Status Indicator */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-medium text-slate-600">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            API Gateway Operational
          </div>
        </div>

        {/* 📊 METRICS GRID */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Active Keys */}
          <div className="group relative bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Active API Keys
              </span>
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-200">
                <KeyRound className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {activeKeysCount}
              </div>
              <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 inline" />
                <span>{keys.length - activeKeysCount} keys revoked</span>
              </p>
            </div>
          </div>

          {/* Card 2: Total Requests */}
          <div className="group relative bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total API Requests
              </span>
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-200">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {totalRequests.toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 mt-1.5 font-medium">
                Recorded in Neon database
              </p>
            </div>
          </div>

          {/* Card 3: Rate Limit */}
          <div className="group relative bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Rate Limit Window
              </span>
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors duration-200">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                10 <span className="text-xs font-bold text-slate-500">req / 10s</span>
              </div>
              <p className="text-xs text-slate-500 mt-1.5 font-medium">
                Limit per API key
              </p>
            </div>
          </div>

          {/* Card 4: Analytics Direct Shortcut */}
          <Link
            href="/dashboard/analytics"
            className="group relative bg-gradient-to-br from-blue-600 to-indigo-700 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between text-white overflow-hidden"
          >
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-100 uppercase tracking-wider">
                Live Analytics
              </span>
              <div className="p-2 bg-white/15 text-white rounded-xl backdrop-blur-sm group-hover:scale-110 transition-transform">
                <BarChart3 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center gap-1 font-bold text-base text-white">
                <span>Latency & Performance</span>
                <ArrowUpRight className="w-4 h-4 text-blue-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <p className="text-xs text-blue-100/80 mt-1 font-medium">
                View response charts &rarr;
              </p>
            </div>
          </Link>

        </section>

        {/* 🔑 API KEY MANAGEMENT CONTAINER */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <ApiKeyManager initialKeys={keys} />
        </section>

      </main>
    </div>
  );
}