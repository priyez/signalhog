"use client";

import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

type TrendData = {
  date: string;
  count: number;
};



export default function MetricsPage() {
  const [data, setData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);

  const projectId = typeof window !== "undefined" ? localStorage.getItem("selectedProjectId") || "" : "";
  const environmentId = typeof window !== "undefined" ? localStorage.getItem("selectedEnvironmentId") || "" : "";
  const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";

  useEffect(() => {
    const loadData = async () => {
      if (!token || !projectId || !environmentId) return;
      try {
        const result = await apiRequest(`/metrics/trends?projectId=${projectId}&environmentId=${environmentId}`, {}, token);
        
        // Generate a continuous array of the last 30 days
        const filledData: TrendData[] = [];
        for (let i = 29; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          filledData.push({ date: dateStr, count: 0 });
        }

        // Merge the database results into our continuous timeline
        result.forEach((r: TrendData) => {
          const existing = filledData.find(d => d.date === r.date);
          if (existing) {
            existing.count += r.count;
          }
        });

        setData(filledData);
      } catch (err) {
        console.error("Failed to load metrics:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [projectId, environmentId]); // eslint-disable-line

  const displayData = data;

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div>
          <h1 className="page-title">Usage Metrics</h1>
          <p className="page-subtitle">Historical trends and usage patterns for your project.</p>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card full-width">
          <div className="metric-card-header">
            <h3 className="metric-card-title">Event Volume (Last 30 Days)</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--color-muted)', fontSize: 11 }} 
                  dy={10}
                  tickFormatter={(str) => {
                    const [year, month, day] = str.split('-');
                    const d = new Date(Number(year), Number(month) - 1, Number(day));
                    const today = new Date();
                    
                    if (
                      d.getDate() === today.getDate() &&
                      d.getMonth() === today.getMonth() &&
                      d.getFullYear() === today.getFullYear()
                    ) {
                      return 'Today';
                    }
                    
                    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                  }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--color-muted)', fontSize: 11 }} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f1f2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: 'var(--color-accent)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="var(--color-accent)" 
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <style jsx>{`
        .metrics-grid {
          display: grid;
          gap: 24px;
        }
        .metric-card {
          background: var(--color-bg-light);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          padding: 24px;
        }
        .metric-card.full-width {
          grid-column: 1 / -1;
        }
        .metric-card-title {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 24px;
          color: var(--color-text);
        }
        .chart-container {
          height: 300px;
          width: 100%;
        }
      `}</style>
    </div>
  );
}
