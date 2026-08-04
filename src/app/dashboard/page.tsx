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
  CreditCard,
  Receipt,
  BarChart3,
  Zap,
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  Layers,
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
  const revokedKeysCount = keys.length - activeKeysCount;

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 font-sans antialiased pb-20 selection:bg-indigo-500 selection:text-white">
      {/* Ambient background light effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* 🟢 TOP NAVIGATION BAR (Dark Glassmorphism) */}
      <header className="sticky top-0 z-30 bg-[#0F172A]/80 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Brand & Workspace Info */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
              API
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-100 tracking-tight">Developer Portal</span>
              <span className="text-slate-700">/</span>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 text-[11px] font-medium shadow-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
                Operational
              </div>
            </div>
          </div>

          {/* Action Header Group */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Analytics Nav */}
            <Link
              href="/dashboard/analytics"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900/90 hover:bg-slate-800 hover:text-white rounded-lg transition-all border border-slate-800 hover:border-slate-700 shadow-sm"
            >
              <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Analytics</span>
            </Link>

            {/* Billing Portal */}
            <form action={createCustomerPortalAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900/90 hover:bg-slate-800 hover:text-white rounded-lg transition-all border border-slate-800 hover:border-slate-700 shadow-sm"
              >
                <Receipt className="w-3.5 h-3.5 text-slate-400" />
                <span>Billing</span>
              </button>
            </form>

            {/* Upgrade Plan */}
            <form action={createCheckoutSessionAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-lg shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98] border border-indigo-500/30"
              >
                <CreditCard className="w-3.5 h-3.5 text-indigo-200" />
                <span>Upgrade</span>
              </button>
            </form>

            <div className="h-4 w-px bg-slate-800 mx-0.5" />

            {/* User Profile */}
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'w-8 h-8 rounded-lg border border-slate-700 shadow-sm',
                },
              }}
            />
          </div>
        </div>
      </header>

      {/* 🚀 MAIN DASHBOARD CONTAINER */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Welcome Banner / Context Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-indigo-950/40 p-6 rounded-2xl border border-slate-800/80 backdrop-blur-md shadow-xl shadow-black/40">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">
                Welcome back, {dbUser.name}
              </h1>
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Manage your API credentials, view system metrics, and control access permissions.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs font-medium text-slate-300 shadow-inner">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Tier: Metered Plan
            </span>
          </div>
        </div>

        {/* 📊 METRICS GRID (4-Column Premium Dark Layout) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Active API Keys */}
          <div className="group bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 backdrop-blur-md hover:border-slate-700 transition-all duration-300 flex flex-col justify-between space-y-4 shadow-lg shadow-black/20 hover:shadow-indigo-500/5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Active Keys
              </span>
              <div className="p-2 bg-indigo-950/80 text-indigo-400 border border-indigo-800/40 rounded-xl group-hover:scale-105 transition-transform">
                <KeyRound className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-white tracking-tight">
                {activeKeysCount}
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{revokedKeysCount} revoked keys</span>
              </p>
            </div>
          </div>

          {/* Card 2: Total API Requests */}
          <div className="group bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 backdrop-blur-md hover:border-slate-700 transition-all duration-300 flex flex-col justify-between space-y-4 shadow-lg shadow-black/20 hover:shadow-emerald-500/5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Requests
              </span>
              <div className="p-2 bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 rounded-xl group-hover:scale-105 transition-transform">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-white tracking-tight">
                {totalRequests.toLocaleString()}
              </div>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                All-time gateway logs
              </p>
            </div>
          </div>

          {/* Card 3: Rate Limit Window */}
          <div className="group bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 backdrop-blur-md hover:border-slate-700 transition-all duration-300 flex flex-col justify-between space-y-4 shadow-lg shadow-black/20 hover:shadow-amber-500/5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Rate Limit
              </span>
              <div className="p-2 bg-amber-950/80 text-amber-400 border border-amber-800/40 rounded-xl group-hover:scale-105 transition-transform">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-white tracking-tight">
                10 <span className="text-xs font-semibold text-slate-500">req/10s</span>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                Standard window threshold
              </p>
            </div>
          </div>

          {/* Card 4: Analytics Direct Shortcut */}
          <Link
            href="/dashboard/analytics"
            className="group bg-gradient-to-br from-slate-900/90 to-blue-950/40 p-5 rounded-2xl border border-blue-900/40 backdrop-blur-md hover:border-blue-500/50 transition-all duration-300 flex flex-col justify-between space-y-4 shadow-lg shadow-black/20 hover:shadow-blue-500/10"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                Real-Time Insights
              </span>
              <div className="p-2 bg-blue-950/80 text-blue-400 border border-blue-800/40 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-200">
                <BarChart3 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between font-bold text-white text-base group-hover:text-blue-400 transition-colors">
                <span>View Analytics</span>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                Latency & request distribution &rarr;
              </p>
            </div>
          </Link>

        </section>

        {/* 🔑 API KEY MANAGEMENT SECTION */}
        <section className="bg-slate-900/60 rounded-2xl border border-slate-800/80 backdrop-blur-md shadow-xl shadow-black/40 p-6 sm:p-8">
          <ApiKeyManager initialKeys={keys} />
        </section>

      </main>
    </div>
  );
}