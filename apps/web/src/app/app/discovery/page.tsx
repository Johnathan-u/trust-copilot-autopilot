"use client";

import { useMemo } from "react";
import { KpiCard } from "@/components/ui/kpi-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Badge } from "@/components/ui/badge";
import { EChartsWrapper } from "@/components/charts/echarts-wrapper";
import { formatNumber } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight, TrendingUp, TrendingDown } from "lucide-react";

const MOCK = {
  pagesPerDay: 847_293,
  signalsPerDay: 62_481,
  sourcesActive: 142,
  crawlBacklog: 23_847,
  freshness: 0.87,
  dedupeRate: 0.34,
  renderRate: 0.12,
  errorRate: 0.03,
  pagesTrend: 0.08,
  signalsTrend: 0.14,
};

const SOURCE_MIX = [
  { name: "Company sites", count: 58, pct: 41, color: "var(--color-syntax-builtin)" },
  { name: "Job boards", count: 34, pct: 24, color: "var(--color-syntax-keyword)" },
  { name: "RSS / News", count: 28, pct: 20, color: "var(--color-syntax-string)" },
  { name: "Trust pages", count: 22, pct: 15, color: "var(--color-syntax-class)" },
];

const RECENT_SIGNALS = [
  { company: "Acme Corp", signal: "soc2_announced", confidence: 0.94, age: "2h" },
  { company: "TechStart Inc", signal: "security_hiring", confidence: 0.88, age: "3h" },
  { company: "DataFlow Ltd", signal: "trust_center_launched", confidence: 0.91, age: "4h" },
  { company: "CloudPeak", signal: "iso27001_mentioned", confidence: 0.86, age: "5h" },
  { company: "FinGuard", signal: "compliance_funding", confidence: 0.92, age: "6h" },
  { company: "SecureNet", signal: "gdpr_update", confidence: 0.79, age: "7h" },
];

function makeThroughputOption() {
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
  const pages = [32000,28000,25000,22000,19000,18000,24000,38000,52000,61000,58000,55000,54000,52000,49000,46000,44000,48000,51000,47000,42000,39000,36000,34000];
  const signals = pages.map((p) => Math.round(p * 0.074));
  return {
    tooltip: { trigger: "axis" as const },
    grid: { left: 50, right: 20, top: 10, bottom: 30 },
    xAxis: { type: "category" as const, data: hours, axisLabel: { color: "#555570", fontSize: 9 }, axisLine: { lineStyle: { color: "#2a2a40" } } },
    yAxis: { type: "value" as const, axisLabel: { color: "#555570", fontSize: 9, formatter: (v: number) => formatNumber(v) }, splitLine: { lineStyle: { color: "#1e1e30" } } },
    series: [
      { name: "Pages", type: "line" as const, data: pages, smooth: true, lineStyle: { color: "#569cd6", width: 2 }, itemStyle: { color: "#569cd6" }, areaStyle: { color: { type: "linear" as const, x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "rgba(86,156,214,0.15)" }, { offset: 1, color: "rgba(86,156,214,0)" }] } }, symbol: "none" },
      { name: "Signals", type: "line" as const, data: signals, smooth: true, lineStyle: { color: "#4ec9b0", width: 2 }, itemStyle: { color: "#4ec9b0" }, areaStyle: { color: { type: "linear" as const, x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "rgba(78,201,176,0.15)" }, { offset: 1, color: "rgba(78,201,176,0)" }] } }, symbol: "none" },
    ],
  };
}

function makeSignalTypesOption() {
  const data = [
    { value: 18, name: "SOC 2" },
    { value: 15, name: "Security Hiring" },
    { value: 12, name: "ISO 27001" },
    { value: 11, name: "Trust Center" },
    { value: 9, name: "Compliance Fund" },
    { value: 8, name: "GDPR" },
    { value: 7, name: "Procurement" },
    { value: 6, name: "Upmarket" },
    { value: 14, name: "Other" },
  ];
  const colors = ["#569cd6","#c586c0","#4ec9b0","#dcdcaa","#ce9178","#6a9955","#9cdcfe","#d7ba7d","#555570"];
  return {
    tooltip: { trigger: "item" as const, formatter: "{b}: {c}% ({d}%)" },
    series: [{
      type: "pie" as const,
      radius: ["40%", "70%"],
      center: ["50%", "50%"],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 4, borderColor: "#1a1a2e", borderWidth: 2 },
      label: { color: "#8888aa", fontSize: 9, fontFamily: "'JetBrains Mono', monospace" },
      data: data.map((d, i) => ({ ...d, itemStyle: { color: colors[i] } })),
    }],
  };
}

function makeSourceHealthOption() {
  const sources = ["Sites", "Jobs", "RSS", "Trust", "Press"];
  const success = [96, 91, 98, 94, 89];
  const errors = [4, 9, 2, 6, 11];
  return {
    tooltip: { trigger: "axis" as const },
    grid: { left: 60, right: 20, top: 10, bottom: 30 },
    xAxis: { type: "category" as const, data: sources, axisLabel: { color: "#555570", fontSize: 9 }, axisLine: { lineStyle: { color: "#2a2a40" } } },
    yAxis: { type: "value" as const, max: 100, axisLabel: { color: "#555570", fontSize: 9, formatter: "{value}%" }, splitLine: { lineStyle: { color: "#1e1e30" } } },
    series: [
      { name: "Success", type: "bar" as const, stack: "total", data: success, itemStyle: { color: "#2ea043", borderRadius: [3, 3, 0, 0] }, barWidth: 28 },
      { name: "Errors", type: "bar" as const, stack: "total", data: errors, itemStyle: { color: "#f85149", borderRadius: [3, 3, 0, 0] }, barWidth: 28 },
    ],
  };
}

export default function DiscoveryPage() {
  const throughputOpt = useMemo(makeThroughputOption, []);
  const signalTypesOpt = useMemo(makeSignalTypesOption, []);
  const sourceHealthOpt = useMemo(makeSourceHealthOption, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mono text-lg font-bold text-text-primary">
            <span className="text-syntax-builtin">def</span> discovery
            <span className="text-text-muted">(</span>
            <span className="text-syntax-class">Dashboard</span>
            <span className="text-text-muted">):</span>
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Signal acquisition pipeline — candidate pages, extraction, and source health
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/app/discovery/sources" className="text-xs text-syntax-param hover:underline flex items-center gap-1">Sources <ArrowRight size={11} /></Link>
          <Link href="/app/discovery/signals" className="text-xs text-syntax-param hover:underline flex items-center gap-1">Signals <ArrowRight size={11} /></Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Pages / Day" value={formatNumber(MOCK.pagesPerDay)} sub={`${MOCK.pagesTrend > 0 ? "+" : ""}${(MOCK.pagesTrend * 100).toFixed(0)}% vs yesterday`} accent="blue" />
        <KpiCard label="Signals / Day" value={formatNumber(MOCK.signalsPerDay)} sub={`${MOCK.signalsTrend > 0 ? "+" : ""}${(MOCK.signalsTrend * 100).toFixed(0)}% vs yesterday`} accent="green" />
        <KpiCard label="Active Sources" value={MOCK.sourcesActive} sub="3 paused · 2 erroring" accent="teal" />
        <KpiCard label="Crawl Backlog" value={formatNumber(MOCK.crawlBacklog)} sub="Queue depth" accent="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Throughput — Last 24h</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pr-2">
            <EChartsWrapper option={throughputOpt} height={240} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Signal Type Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <EChartsWrapper option={signalTypesOpt} height={240} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Source Mix</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {SOURCE_MIX.map((source) => (
              <div key={source.name} className="flex items-center gap-3">
                <span className="font-mono text-xs text-text-secondary w-28 truncate">{source.name}</span>
                <ProgressBar value={source.pct} color={source.color} className="flex-1" />
                <span className="font-mono text-[0.65rem] text-text-muted w-8 text-right">{source.pct}%</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pipeline Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Content freshness", value: MOCK.freshness, color: "var(--color-accent-green)" },
              { label: "Dedupe rate", value: MOCK.dedupeRate, color: "var(--color-syntax-keyword)" },
              { label: "JS render rate", value: MOCK.renderRate, color: "var(--color-syntax-param)" },
              { label: "Error rate", value: MOCK.errorRate, color: "var(--color-accent-red)" },
            ].map((m) => (
              <div key={m.label} className="flex items-center justify-between">
                <span className="text-xs text-text-secondary">{m.label}</span>
                <div className="flex items-center gap-2">
                  <ProgressBar value={m.value * 100} color={m.color} className="w-20" />
                  <span className="font-mono text-xs font-semibold w-10 text-right" style={{ color: m.color }}>{(m.value * 100).toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Source Health</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <EChartsWrapper option={sourceHealthOpt} height={200} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Recent Signals</CardTitle>
          <Link href="/app/discovery/signals" className="text-[0.65rem] text-syntax-param hover:underline flex items-center gap-1">View all <ArrowRight size={10} /></Link>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-default">
                {["Company", "Signal", "Confidence", "Age"].map((h) => (
                  <th key={h} className="px-5 py-2 text-left font-mono text-[0.6rem] font-semibold text-text-muted uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RECENT_SIGNALS.map((sig, i) => (
                <tr key={i} className="border-b border-border-default hover:bg-bg-card transition-colors cursor-pointer">
                  <td className="px-5 py-2.5 font-mono text-xs text-text-primary font-medium">{sig.company}</td>
                  <td className="px-5 py-2.5"><Badge variant="tech">{sig.signal.replace(/_/g, " ")}</Badge></td>
                  <td className="px-5 py-2.5">
                    <span className="font-mono text-xs font-semibold" style={{ color: sig.confidence >= 0.9 ? "var(--color-accent-green)" : sig.confidence >= 0.8 ? "var(--color-syntax-function)" : "var(--color-accent-yellow)" }}>
                      {(sig.confidence * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="px-5 py-2.5 font-mono text-[0.68rem] text-text-muted">{sig.age}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
