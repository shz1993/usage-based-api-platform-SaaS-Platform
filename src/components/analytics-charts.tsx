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
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="date" 
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }} 
          />
          <YAxis 
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }} 
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              padding: '8px 12px',
            }}
            labelStyle={{ color: '#64748b', fontWeight: 600, fontSize: '12px' }}
            itemStyle={{ color: '#2563eb', fontWeight: 700, fontSize: '14px' }}
            formatter={(value: any) => [`${value} calls`, 'Total Requests']}
          />
          <Area 
            type="monotone" 
            dataKey="requests" 
            stroke="#2563eb" 
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
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="date" 
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }} 
          />
          <YAxis 
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }} 
            unit=" ms" 
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              padding: '8px 12px',
            }}
            labelStyle={{ color: '#64748b', fontWeight: 600, fontSize: '12px' }}
            itemStyle={{ color: '#059669', fontWeight: 700, fontSize: '14px' }}
            formatter={(value: any) => [`${value} ms`, 'Avg Latency']}
          />
          <Bar dataKey="avgLatency" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}