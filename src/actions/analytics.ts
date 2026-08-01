// src/actions/analytics.ts
'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { apiLogs } from '@/db/schema';
import { eq, gte, and, sql } from 'drizzle-orm';

export interface UsageMetric {
  date: string;
  requests: number;
  avgLatency: number;
}

export async function getAnalyticsDataAction(): Promise<{
  metrics: UsageMetric[];
  totalRequests: number;
  avgLatencyTotal: number;
  successRate: number;
}> {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  // Get data for the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  try {
    // 1. Daily Aggregate Query (Group By Date) for Recharts
    const dailyStats = await db
      .select({
        date: sql<string>`TO_CHAR(${apiLogs.createdAt}, 'Mon DD')`,
        rawDate: sql<string>`DATE(${apiLogs.createdAt})`,
        requests: sql<number>`CAST(COUNT(*) AS INTEGER)`,
        avgLatency: sql<number>`COALESCE(ROUND(AVG(${apiLogs.latencyMs})), 0)::INTEGER`,
      })
      .from(apiLogs)
      .where(
        and(
          eq(apiLogs.userId, userId),
          gte(apiLogs.createdAt, sevenDaysAgo)
        )
      )
      .groupBy(
        sql`DATE(${apiLogs.createdAt})`,
        sql`TO_CHAR(${apiLogs.createdAt}, 'Mon DD')`
      )
      .orderBy(sql`DATE(${apiLogs.createdAt})`);

    // 2. Summary Metrics Query (Total Requests, Avg Latency, & Success Rate)
    const [summary] = await db
      .select({
        totalRequests: sql<number>`CAST(COUNT(*) AS INTEGER)`,
        avgLatencyTotal: sql<number>`COALESCE(ROUND(AVG(${apiLogs.latencyMs})), 0)::INTEGER`,
        successfulRequests: sql<number>`CAST(COUNT(CASE WHEN ${apiLogs.statusCode} >= 200 AND ${apiLogs.statusCode} < 400 THEN 1 END) AS INTEGER)`,
      })
      .from(apiLogs)
      .where(
        and(
          eq(apiLogs.userId, userId),
          gte(apiLogs.createdAt, sevenDaysAgo)
        )
      );

    const totalRequests = summary?.totalRequests || 0;
    const avgLatencyTotal = summary?.avgLatencyTotal || 0;
    const successfulRequests = summary?.successfulRequests || 0;

    // Calculate success percentage (HTTP Status 2xx - 3xx)
    const successRate = totalRequests > 0
      ? Number(((successfulRequests / totalRequests) * 100).toFixed(1))
      : 100;

    // Format data for Recharts
    const metrics: UsageMetric[] = dailyStats.map((item) => ({
      date: item.date,
      requests: Number(item.requests),
      avgLatency: Number(item.avgLatency),
    }));

    return {
      metrics,
      totalRequests,
      avgLatencyTotal,
      successRate,
    };
  } catch (error) {
    console.error('❌ Error fetching analytics:', error);
    return {
      metrics: [],
      totalRequests: 0,
      avgLatencyTotal: 0,
      successRate: 100,
    };
  }
}