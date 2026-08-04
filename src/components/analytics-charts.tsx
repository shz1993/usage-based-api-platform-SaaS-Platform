// src/components/analytics-charts.tsx
'use client';

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { UsageMetric } from '@/actions/analytics';

interface AnalyticsChartsProps {
  data: UsageMetric[];
}

export function APIUsageChart({ data }: AnalyticsChartsProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="usageGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
          <XAxis 
            dataKey="date" 
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} 
          />
          <YAxis 
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} 
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderRadius: '12px',
              border: '1px solid #334155',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
              padding: '8px 12px',
            }}
            labelStyle={{ color: '#94a3b8', fontWeight: 600, fontSize: '12px' }}
            itemStyle={{ color: '#60a5fa', fontWeight: 700, fontSize: '14px' }}
            formatter={(value: any) => [`${value} calls`, 'Total Requests']}
          />
          <Area 
            type="monotone" 
            dataKey="requests" 
            stroke="#3b82f6" 
            strokeWidth={2} 
            fillOpacity={1} 
            fill="url(#usageGradient)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function APILatencyChart({ data }: AnalyticsChartsProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
          <XAxis 
            dataKey="date" 
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} 
          />
          <YAxis 
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} 
            unit=" ms" 
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderRadius: '12px',
              border: '1px solid #334155',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
              padding: '8px 12px',
            }}
            labelStyle={{ color: '#94a3b8', fontWeight: 600, fontSize: '12px' }}
            itemStyle={{ color: '#34d399', fontWeight: 700, fontSize: '14px' }}
            formatter={(value: any) => [`${value} ms`, 'Avg Latency']}
          />
          <Bar dataKey="avgLatency" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}