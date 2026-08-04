// src/app/dashboard/analytics/page.tsx
import Link from 'next/link';
import { getAnalyticsDataAction } from '@/actions/analytics';
import { APIUsageChart, APILatencyChart } from '@/components/analytics-charts';
import { Activity, Zap, CheckCircle2, ArrowLeft, BarChart3 } from 'lucide-react';

export default async function AnalyticsPage() {
  const { metrics, totalRequests, avgLatencyTotal, successRate } =
    await getAnalyticsDataAction();

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 font-sans antialiased p-6 md:p-10 selection:bg-indigo-500 selection:text-white">
      {/* Ambient background light effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <main className="relative max-w-6xl mx-auto space-y-8">
        {/* Header with Back Button */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between border border-slate-800/80 bg-slate-900/60 p-4 rounded-2xl backdrop-blur-md shadow-xl shadow-black/40 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-950/80 text-blue-400 border border-blue-800/40 rounded-xl">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                API Analytics
              </h1>
              <p className="text-xs text-slate-400">
                Monitor API call volume and real-time response performance.
              </p>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="flex items-center gap-2 bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white font-medium text-xs px-4 py-2 rounded-xl transition border border-slate-800 hover:border-slate-700 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </header>

        {/* Summary Metric Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Total Requests */}
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 backdrop-blur-md shadow-lg shadow-black/20 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Total API Requests
              </span>
              <div className="p-2 bg-blue-950/80 text-blue-400 border border-blue-800/40 rounded-xl">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {totalRequests.toLocaleString()}
            </div>
            <p className="text-xs text-slate-400 font-medium">Last 7 days</p>
          </div>

          {/* Card 2: Avg Latency */}
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 backdrop-blur-md shadow-lg shadow-black/20 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Avg Latency
              </span>
              <div className="p-2 bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 rounded-xl">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {avgLatencyTotal} ms
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Average response speed
            </p>
          </div>

          {/* Card 3: Success Rate */}
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 backdrop-blur-md shadow-lg shadow-black/20 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Success Rate
              </span>
              <div className="p-2 bg-indigo-950/80 text-indigo-400 border border-indigo-800/40 rounded-xl">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {successRate}%
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Successful HTTP responses
            </p>
          </div>
        </section>

        {/* Recharts Visual Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 backdrop-blur-md shadow-xl shadow-black/40 space-y-4">
            <h2 className="text-base font-bold text-white tracking-tight">
              API Usage Over Time
            </h2>
            <APIUsageChart data={metrics} />
          </div>

          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 backdrop-blur-md shadow-xl shadow-black/40 space-y-4">
            <h2 className="text-base font-bold text-white tracking-tight">
              Average Latency (ms)
            </h2>
            <APILatencyChart data={metrics} />
          </div>
        </section>
      </main>
    </div>
  );
}