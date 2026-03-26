"use client";

import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import { EChartsWrapper } from "@/components/charts/echarts-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/ui/kpi-card";
import { cn } from "@/lib/utils";

const CHART_COLORS = ["#569cd6", "#c586c0", "#4ec9b0", "#ce9178"] as const;

function makeTrendOption(): EChartsOption {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const seriesNames = [
    "job_board",
    "trust_page",
    "rss",
    "company_site",
  ] as const;
  const seriesData: number[][] = [
    [82, 84, 81, 88, 90, 89, 92],
    [76, 78, 74, 80, 83, 85, 87],
    [91, 90, 92, 93, 94, 95, 96],
    [68, 70, 65, 72, 75, 78, 80],
  ];

  return {
    backgroundColor: "transparent",
    textStyle: {
      color: "#8888aa",
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 10,
    },
    grid: {
      left: 48,
      right: 20,
      top: 28,
      bottom: 56,
      containLabel: true,
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: "#1e1e30",
      borderColor: "#2a2a40",
      borderWidth: 1,
      textStyle: {
        color: "#d4d4e8",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
      },
    },
    legend: {
      data: [...seriesNames],
      bottom: 4,
      textStyle: { color: "#8888aa", fontSize: 10 },
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: days,
      axisLine: { lineStyle: { color: "#2a2a40" } },
      axisTick: { lineStyle: { color: "#2a2a40" } },
      axisLabel: { color: "#555570", fontFamily: "'JetBrains Mono', monospace" },
      splitLine: { show: true, lineStyle: { color: "#1e1e30" } },
    },
    yAxis: {
      type: "value",
      min: 0,
      max: 100,
      axisLine: { lineStyle: { color: "#2a2a40" } },
      axisTick: { lineStyle: { color: "#2a2a40" } },
      axisLabel: {
        color: "#555570",
        formatter: "{value}%",
        fontFamily: "'JetBrains Mono', monospace",
      },
      splitLine: { lineStyle: { color: "#1e1e30" } },
    },
    series: seriesNames.map((name, i) => ({
      name,
      type: "line" as const,
      smooth: true,
      symbol: "circle",
      symbolSize: 4,
      lineStyle: { width: 2, color: CHART_COLORS[i] },
      itemStyle: { color: CHART_COLORS[i] },
      data: seriesData[i],
    })),
  };
}

type SourceStatus = "healthy" | "degraded" | "failed";

interface SourceHealthRow {
  id: string;
  source: string;
  healthScore: number;
  successRate: number;
  avgLatencyMs: number;
  robotsBlocks: number;
  lastFailure: string;
  status: SourceStatus;
}

const MOCK_SOURCES: SourceHealthRow[] = [
  {
    id: "1",
    source: "scrape-old-vendor.io/catalog",
    healthScore: 28,
    successRate: 0.31,
    avgLatencyMs: 8420,
    robotsBlocks: 412,
    lastFailure: "12m ago",
    status: "failed",
  },
  {
    id: "2",
    source: "indeed.com/security-jobs",
    healthScore: 36,
    successRate: 0.44,
    avgLatencyMs: 3100,
    robotsBlocks: 89,
    lastFailure: "2h ago",
    status: "failed",
  },
  {
    id: "3",
    source: "legacy-cms.partner.net/rss",
    healthScore: 48,
    successRate: 0.58,
    avgLatencyMs: 1850,
    robotsBlocks: 22,
    lastFailure: "6h ago",
    status: "degraded",
  },
  {
    id: "4",
    source: "linkedin.com/jobs/api",
    healthScore: 55,
    successRate: 0.67,
    avgLatencyMs: 920,
    robotsBlocks: 14,
    lastFailure: "1d ago",
    status: "degraded",
  },
  {
    id: "5",
    source: "greenhouse.io/boards/acme",
    healthScore: 72,
    successRate: 0.81,
    avgLatencyMs: 540,
    robotsBlocks: 3,
    lastFailure: "3d ago",
    status: "degraded",
  },
  {
    id: "6",
    source: "trust.stripe.com",
    healthScore: 88,
    successRate: 0.94,
    avgLatencyMs: 210,
    robotsBlocks: 0,
    lastFailure: "9d ago",
    status: "healthy",
  },
  {
    id: "7",
    source: "news.securityweek.com/feed",
    healthScore: 93,
    successRate: 0.97,
    avgLatencyMs: 180,
    robotsBlocks: 0,
    lastFailure: "14d ago",
    status: "healthy",
  },
  {
    id: "8",
    source: "api.glassdoor.com/v2",
    healthScore: 97,
    successRate: 0.99,
    avgLatencyMs: 95,
    robotsBlocks: 0,
    lastFailure: "—",
    status: "healthy",
  },
];

function healthBarColor(score: number) {
  if (score >= 80) return "bg-accent-green";
  if (score >= 45) return "bg-accent-yellow";
  return "bg-accent-red";
}

function healthBarTrackClass(score: number) {
  if (score >= 80) return "bg-accent-green/25";
  if (score >= 45) return "bg-accent-yellow/20";
  return "bg-accent-red/20";
}

const statusBadge: Record<
  SourceStatus,
  { variant: "success" | "warning" | "p0"; label: string }
> = {
  healthy: { variant: "success", label: "healthy" },
  degraded: { variant: "warning", label: "degraded" },
  failed: { variant: "p0", label: "failed" },
};

export default function SourceHealthPage() {
  const trendOption = useMemo(() => makeTrendOption(), []);

  const kpis = useMemo(() => {
    const healthy = MOCK_SOURCES.filter((s) => s.status === "healthy").length;
    const degraded = MOCK_SOURCES.filter((s) => s.status === "degraded").length;
    const failed = MOCK_SOURCES.filter((s) => s.status === "failed").length;
    const avgLat =
      MOCK_SOURCES.reduce((a, s) => a + s.avgLatencyMs, 0) /
      MOCK_SOURCES.length;
    return { healthy, degraded, failed, avgLat: Math.round(avgLat) };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-mono text-lg font-bold text-text-primary">
          <span className="text-syntax-builtin">def</span> source_health
          <span className="text-text-muted">(</span>
          <span className="text-syntax-class">Dashboard</span>
          <span className="text-text-muted">):</span>
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Per-source success rate, latency, and alert state
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Healthy sources"
          value={kpis.healthy}
          sub="passing SLO"
          accent="green"
        />
        <KpiCard
          label="Degraded"
          value={kpis.degraded}
          sub="elevated errors / latency"
          accent="orange"
        />
        <KpiCard
          label="Failed"
          value={kpis.failed}
          sub="below minimum threshold"
          accent="red"
        />
        <KpiCard
          label="Avg latency"
          value={`${kpis.avgLat}ms`}
          sub="rolling 24h p50"
          accent="teal"
        />
      </div>

      <Card className="border-border-default bg-bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="font-mono text-sm text-syntax-keyword">
            Success rate — 7d trend (top source types)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EChartsWrapper option={trendOption} height={300} />
        </CardContent>
      </Card>

      <Card className="border-border-default bg-bg-editor overflow-hidden">
        <CardHeader className="border-b border-border-default bg-bg-root pb-3">
          <CardTitle className="font-mono text-sm text-text-secondary">
            Sources by health score
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-border-default">
                  {[
                    "Source",
                    "Health score",
                    "Success rate",
                    "Avg latency",
                    "Robots blocks",
                    "Last failure",
                    "Status",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-left font-mono text-[0.6rem] font-semibold uppercase tracking-wider text-text-muted"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_SOURCES.map((row) => {
                  const sb = statusBadge[row.status];
                  return (
                    <tr
                      key={row.id}
                      className={cn(
                        "border-b border-border-default transition-colors hover:bg-bg-card",
                        row.status === "failed" &&
                          "bg-accent-red/10 border-l-2 border-l-accent-red",
                        row.status === "degraded" &&
                          "bg-accent-yellow/5 border-l-2 border-l-accent-yellow"
                      )}
                    >
                      <td
                        className={cn(
                          "px-4 py-2.5 font-mono text-xs font-medium",
                          row.status === "failed" && "text-accent-red",
                          row.status === "degraded" && "text-accent-yellow",
                          row.status === "healthy" && "text-text-primary"
                        )}
                      >
                        {row.source}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "h-2 flex-1 max-w-[120px] overflow-hidden rounded-full",
                              healthBarTrackClass(row.healthScore)
                            )}
                          >
                            <div
                              className={cn(
                                "h-full rounded-full transition-all",
                                healthBarColor(row.healthScore)
                              )}
                              style={{ width: `${row.healthScore}%` }}
                            />
                          </div>
                          <span
                            className={cn(
                              "font-mono text-[0.68rem] font-semibold tabular-nums",
                              row.healthScore >= 80 && "text-accent-green",
                              row.healthScore >= 45 &&
                                row.healthScore < 80 &&
                                "text-accent-yellow",
                              row.healthScore < 45 && "text-accent-red"
                            )}
                          >
                            {row.healthScore}
                          </span>
                        </div>
                      </td>
                      <td
                        className={cn(
                          "px-4 py-2.5 font-mono text-xs tabular-nums",
                          row.successRate >= 0.85
                            ? "text-accent-green"
                            : row.successRate >= 0.6
                              ? "text-accent-yellow"
                              : "text-accent-red"
                        )}
                      >
                        {(row.successRate * 100).toFixed(0)}%
                      </td>
                      <td className="px-4 py-2.5 font-mono text-[0.68rem] text-syntax-param tabular-nums">
                        {row.avgLatencyMs}ms
                      </td>
                      <td
                        className={cn(
                          "px-4 py-2.5 font-mono text-[0.68rem] tabular-nums",
                          row.robotsBlocks > 20
                            ? "text-accent-red"
                            : "text-text-secondary"
                        )}
                      >
                        {row.robotsBlocks}
                      </td>
                      <td
                        className={cn(
                          "px-4 py-2.5 font-mono text-[0.65rem]",
                          row.lastFailure !== "—"
                            ? "text-syntax-string"
                            : "text-text-muted"
                        )}
                      >
                        {row.lastFailure}
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge variant={sb.variant}>{sb.label}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
