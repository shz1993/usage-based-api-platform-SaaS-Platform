// src/app/dashboard/analytics/page.tsx
import Link from 'next/link';
import { getAnalyticsDataAction } from '@/actions/analytics';
import { APIUsageChart, APILatencyChart } from '@/components/analytics-charts';
import { Activity, Zap, CheckCircle2, ArrowLeft, BarChart3 } from 'lucide-react';

export default async function AnalyticsPage() {
  const { metrics, totalRequests, avgLatencyTotal, successRate } =
    await getAnalyticsDataAction();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-10">
      <main className="max-w-6xl mx-auto space-y-8">
        {/* Header with Back Button */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between border border-slate-200 bg-white p-4 rounded-xl shadow-sm gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">API Analytics</h1>
              <p className="text-xs text-slate-500">
                Monitor API call volume and real-time response performance.
              </p>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs px-4 py-2 rounded-lg transition border border-slate-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </header>

        {/* Summary Metric Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Total Requests */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-600">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Total API Requests
              </span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900">
              {totalRequests.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 font-medium">Last 7 days</p>
          </div>

          {/* Card 2: Avg Latency */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-600">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Avg Latency
              </span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900">
              {avgLatencyTotal} ms
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Average response speed
            </p>
          </div>

          {/* Card 3: Success Rate */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-600">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Success Rate
              </span>
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900">
              {successRate}%
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Successful HTTP responses
            </p>
          </div>
        </section>

        {/* Recharts Visual Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900">
              API Usage Over Time
            </h2>
            <APIUsageChart data={metrics} />
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900">
              Average Latency (ms)
            </h2>
            <APILatencyChart data={metrics} />
          </div>
        </section>
      </main>
    </div>
  );
}