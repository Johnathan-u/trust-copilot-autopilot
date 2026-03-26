"use client";

import { useMemo } from "react";
import { Gauge, ArrowUpDown, Minus, Plus } from "lucide-react";
import { KpiCard } from "@/components/ui/kpi-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { EChartsWrapper } from "@/components/charts/echarts-wrapper";
import { cn } from "@/lib/utils";

const MOCK = {
  dailyBudget: 1_000_000,
  used: 847_293,
  concurrency: 48,
  maxConcurrency: 64,
  queueDepth: 23_847,
  maxQueue: 100_000,
  backpressure: false,
};

const SOURCE_BUDGETS = [
  { source: "greenhouse.io", daily: 200_000, used: 178_400, concurrency: 12, status: "ok" },
  { source: "lever.co", daily: 150_000, used: 142_300, concurrency: 8, status: "ok" },
  { source: "trustpage.com", daily: 100_000, used: 84_200, concurrency: 6, status: "ok" },
  { source: "techcrunch.com", daily: 50_000, used: 48_100, concurrency: 4, status: "ok" },
  { source: "indeed.com", daily: 180_000, used: 42_000, concurrency: 2, status: "throttled" },
  { source: "linkedin.com", daily: 200_000, used: 0, concurrency: 0, status: "paused" },
];

function makeQueueChart() {
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
  const depth = [18000,16000,14000,12000,11000,10000,12000,18000,28000,35000,32000,29000,27000,25000,23000,21000,20000,22000,25000,24000,22000,20000,19000,18000];
  const capacity = Array(24).fill(100000);
  return {
    tooltip: { trigger: "axis" as const },
    grid: { left: 55, right: 20, top: 10, bottom: 30 },
    xAxis: { type: "category" as const, data: hours, axisLabel: { color: "#555570", fontSize: 9 }, axisLine: { lineStyle: { color: "#2a2a40" } } },
    yAxis: { type: "value" as const, axisLabel: { color: "#555570", fontSize: 9, formatter: (v: number) => v >= 1000 ? (v/1000)+"K" : v+"" }, splitLine: { lineStyle: { color: "#1e1e30" } } },
    series: [
      { name: "Queue Depth", type: "line" as const, data: depth, smooth: true, lineStyle: { color: "#c586c0", width: 2 }, itemStyle: { color: "#c586c0" }, areaStyle: { color: { type: "linear" as const, x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "rgba(197,134,192,0.15)" }, { offset: 1, color: "rgba(197,134,192,0)" }] } }, symbol: "none" },
      { name: "Capacity", type: "line" as const, data: capacity, lineStyle: { color: "#2a2a40", width: 1, type: "dashed" as const }, itemStyle: { color: "#2a2a40" }, symbol: "none" },
    ],
  };
}

export default function DiscoveryBudgetsPage() {
  const queueOpt = useMemo(makeQueueChart, []);
  const pctUsed = MOCK.dailyBudget > 0 ? MOCK.used / MOCK.dailyBudget : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-mono text-lg font-bold text-text-primary">
          <span className="text-syntax-builtin">def</span> throughput_controls
          <span className="text-text-muted">(</span>
          <span className="text-syntax-class">View</span>
          <span className="text-text-muted">):</span>
        </h1>
        <p className="text-xs text-text-muted mt-1">Crawl budgets, concurrency, queue depth, and backpressure controls</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Daily Budget" value={`${(pctUsed * 100).toFixed(0)}%`} sub={`${MOCK.used.toLocaleString()} / ${MOCK.dailyBudget.toLocaleString()}`} accent="blue" />
        <KpiCard label="Concurrency" value={`${MOCK.concurrency} / ${MOCK.maxConcurrency}`} sub="Active workers" accent="purple" />
        <KpiCard label="Queue Depth" value={MOCK.queueDepth.toLocaleString()} sub={`${((MOCK.queueDepth / MOCK.maxQueue) * 100).toFixed(0)}% of max`} accent="teal" />
        <KpiCard label="Backpressure" value={MOCK.backpressure ? "ACTIVE" : "None"} sub={MOCK.backpressure ? "Throttling active" : "System healthy"} accent={MOCK.backpressure ? "red" : "green"} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Queue Depth — Last 24h</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pr-2">
          <EChartsWrapper option={queueOpt} height={220} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Per-Source Budgets</CardTitle>
          <span className="font-mono text-[0.6rem] text-text-muted">{SOURCE_BUDGETS.length} sources configured</span>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-default">
                {["Source", "Daily Budget", "Used", "Usage", "Concurrency", "Status", "Throttle"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left font-mono text-[0.6rem] font-semibold text-text-muted uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SOURCE_BUDGETS.map((s) => {
                const pct = s.daily > 0 ? s.used / s.daily : 0;
                return (
                  <tr key={s.source} className="border-b border-border-default hover:bg-bg-card transition-colors">
                    <td className="px-4 py-2.5 font-mono text-xs text-text-primary font-medium">{s.source}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-text-secondary">{s.daily.toLocaleString()}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-text-secondary">{s.used.toLocaleString()}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <ProgressBar value={pct * 100} color={pct > 0.9 ? "var(--color-accent-red)" : pct > 0.7 ? "var(--color-accent-yellow)" : "var(--color-syntax-class)"} className="w-16" />
                        <span className="font-mono text-[0.65rem] text-text-muted">{(pct * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-syntax-param">{s.concurrency}</td>
                    <td className="px-4 py-2.5">
                      <Badge variant={s.status === "ok" ? "success" : s.status === "throttled" ? "warning" : "default"}>
                        {s.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6"><Minus size={11} /></Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6"><Plus size={11} /></Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
