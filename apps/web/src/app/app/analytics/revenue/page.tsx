"use client";

import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/ui/kpi-card";
import { EChartsWrapper } from "@/components/charts/echarts-wrapper";

const FUNNEL = [
  { value: 10000, name: "Discovered" },
  { value: 2400, name: "Qualified" },
  { value: 800, name: "Contacted" },
  { value: 340, name: "Replied" },
  { value: 120, name: "Meeting" },
  { value: 80, name: "Offer Sent" },
  { value: 24, name: "Paid" },
];

const CONVERSIONS = [
  { from: "Discovered", to: "Qualified", rate: "24.0%" },
  { from: "Qualified", to: "Contacted", rate: "33.3%" },
  { from: "Contacted", to: "Replied", rate: "42.5%" },
  { from: "Replied", to: "Meeting", rate: "35.3%" },
  { from: "Meeting", to: "Offer Sent", rate: "66.7%" },
  { from: "Offer Sent", to: "Paid", rate: "30.0%" },
];

const MONTHS = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
const MRR = [128000, 142000, 156000, 168000, 181000, 194000];

const TOP_ACCOUNTS = [
  { name: "Vertex Analytics Inc.", value: "$420k", stage: "Negotiation", prob: "72%", close: "Apr 8" },
  { name: "Northwind Labs", value: "$310k", stage: "Proposal", prob: "58%", close: "Apr 22" },
  { name: "Globex Systems", value: "$285k", stage: "Discovery", prob: "41%", close: "May 2" },
  { name: "Helios Data Co.", value: "$198k", stage: "Qualified", prob: "35%", close: "May 14" },
  { name: "Blue River AI", value: "$176k", stage: "Meeting Set", prob: "48%", close: "Apr 30" },
  { name: "Kite Security", value: "$142k", stage: "Technical Win", prob: "64%", close: "Apr 18" },
];

export default function RevenueFunnelPage() {
  const funnelOption = useMemo<EChartsOption>(
    () => ({
      color: ["#569cd6", "#4ec9b0", "#c586c0", "#ce9178", "#6a9955", "#dcdcaa", "#569cd6"],
      series: [
        {
          type: "funnel",
          orient: "horizontal",
          sort: "none",
          minSize: "6%",
          maxSize: "100%",
          gap: 3,
          left: 16,
          right: 120,
          top: 24,
          bottom: 24,
          width: "72%",
          label: {
            show: true,
            position: "inside",
            color: "#1e1e30",
            fontSize: 10,
            fontFamily: "'JetBrains Mono', monospace",
            formatter: "{b}\n{c}",
          },
          data: FUNNEL,
        },
      ],
    }),
    []
  );

  const mrrOption = useMemo<EChartsOption>(
    () => ({
      color: ["#4ec9b0"],
      grid: { left: 48, right: 16, top: 24, bottom: 28 },
      xAxis: {
        type: "category",
        data: MONTHS,
        axisLabel: { color: "#555570", fontSize: 10 },
      },
      yAxis: {
        type: "value",
        axisLabel: {
          color: "#555570",
          fontSize: 10,
          formatter: (v: number) => `$${(v / 1000).toFixed(0)}k`,
        },
        splitLine: { lineStyle: { color: "#1e1e30" } },
      },
      tooltip: { trigger: "axis" },
      series: [
        {
          type: "bar",
          barWidth: "48%",
          data: MRR,
          itemStyle: { borderRadius: [4, 4, 0, 0] },
        },
      ],
    }),
    []
  );

  return (
    <div className="space-y-6 bg-bg-root min-h-full">
      <div>
        <h1 className="font-mono text-lg font-bold text-text-primary">
          <span className="text-syntax-builtin">def</span> revenue_funnel
          <span className="text-text-muted">(</span>
          <span className="text-syntax-class">Dashboard</span>
          <span className="text-text-muted">):</span>
        </h1>
        <p className="text-xs text-text-muted mt-1 font-mono">
          Pipeline stages, conversion efficiency, and revenue momentum.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Pipeline Value" value="$4.2M" sub="open + late stage" accent="blue" />
        <KpiCard label="Active Deals" value="186" sub="weighted" accent="teal" />
        <KpiCard label="Won (30d)" value="$612k" sub="closed-won" accent="green" />
        <KpiCard label="Avg Deal Size" value="$48.2k" sub="last 90d" accent="purple" />
      </div>

      <Card className="border-border-default bg-bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-mono text-sm text-text-primary">Revenue funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <EChartsWrapper option={funnelOption} height={320} />
        </CardContent>
      </Card>

      <Card className="border-border-default bg-bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-mono text-sm text-text-primary">Stage conversion rates</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 font-mono text-xs text-text-secondary">
            {CONVERSIONS.map((c) => (
              <li key={`${c.from}-${c.to}`} className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border-default border-dashed pb-2 last:border-0">
                <span>
                  <span className="text-syntax-param">{c.from}</span>
                  <span className="text-text-muted"> → </span>
                  <span className="text-syntax-string">{c.to}</span>
                </span>
                <span className="text-accent-green tabular-nums">{c.rate}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="border-border-default bg-bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-mono text-sm text-text-primary">Revenue by month (MRR)</CardTitle>
        </CardHeader>
        <CardContent>
          <EChartsWrapper option={mrrOption} height={260} />
        </CardContent>
      </Card>

      <Card className="border-border-default bg-bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-mono text-sm text-text-primary">Top accounts</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full font-mono text-xs">
              <thead>
                <tr className="border-b border-border-default bg-bg-editor text-left text-text-muted uppercase tracking-wider">
                  <th className="px-4 py-2 font-medium">Account</th>
                  <th className="px-4 py-2 font-medium">Deal value</th>
                  <th className="px-4 py-2 font-medium">Stage</th>
                  <th className="px-4 py-2 font-medium">Probability</th>
                  <th className="px-4 py-2 font-medium">Expected close</th>
                </tr>
              </thead>
              <tbody className="text-text-secondary">
                {TOP_ACCOUNTS.map((a) => (
                  <tr key={a.name} className="border-b border-border-default hover:bg-bg-card-hover/50">
                    <td className="px-4 py-2.5 text-text-primary">{a.name}</td>
                    <td className="px-4 py-2.5 text-syntax-class">{a.value}</td>
                    <td className="px-4 py-2.5">
                      <Badge variant="default">{a.stage}</Badge>
                    </td>
                    <td className="px-4 py-2.5 text-syntax-param">{a.prob}</td>
                    <td className="px-4 py-2.5 text-text-muted">{a.close}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
