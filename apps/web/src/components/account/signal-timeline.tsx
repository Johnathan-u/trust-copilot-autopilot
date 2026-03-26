"use client";

import { useMemo, useState } from "react";
import type { EChartsOption } from "echarts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EChartsWrapper } from "@/components/charts/echarts-wrapper";
import { cn } from "@/lib/utils";

const COLORS = {
  blue: "#569cd6",
  purple: "#c586c0",
  teal: "#4ec9b0",
  orange: "#ce9178",
  green: "#6a9955",
  gold: "#dcdcaa",
  red: "#f85149",
  grid: "#1e1e30",
  axis: "#2a2a40",
} as const;

const SIGNAL_TYPE_FILTERS = ["All", "SOC 2", "Security Hiring", "Trust Center", "ISO 27001"] as const;
type SignalTypeFilter = (typeof SIGNAL_TYPE_FILTERS)[number];

type SignalType = Exclude<SignalTypeFilter, "All">;

type SignalEvent = {
  id: string;
  date: Date;
  type: SignalType;
  confidence: number;
  sourceUrl: string;
};

const TYPE_COLOR: Record<SignalType, string> = {
  "SOC 2": COLORS.blue,
  "Security Hiring": COLORS.purple,
  "Trust Center": COLORS.teal,
  "ISO 27001": COLORS.orange,
};

function freshnessWeight(eventDate: Date, now: Date, halfLifeDays = 12): number {
  const ageMs = now.getTime() - eventDate.getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  return Math.exp(-(Math.LN2 / halfLifeDays) * ageDays);
}

function buildMockSignals(now: Date): SignalEvent[] {
  const d = (daysAgo: number) => new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return [
    {
      id: "1",
      date: d(28),
      type: "SOC 2",
      confidence: 0.82,
      sourceUrl: "https://jobs.acme.io/o/security-engineer",
    },
    {
      id: "2",
      date: d(22),
      type: "Security Hiring",
      confidence: 0.71,
      sourceUrl: "https://linkedin.com/company/acme/jobs",
    },
    {
      id: "3",
      date: d(18),
      type: "Trust Center",
      confidence: 0.88,
      sourceUrl: "https://trust.acme.io/security",
    },
    {
      id: "4",
      date: d(15),
      type: "ISO 27001",
      confidence: 0.65,
      sourceUrl: "https://acme.io/blog/iso27001-journey",
    },
    {
      id: "5",
      date: d(12),
      type: "SOC 2",
      confidence: 0.79,
      sourceUrl: "https://security.acme.io/compliance",
    },
    {
      id: "6",
      date: d(7),
      type: "Trust Center",
      confidence: 0.92,
      sourceUrl: "https://trust.acme.io/subprocessors",
    },
    {
      id: "7",
      date: d(3),
      type: "Security Hiring",
      confidence: 0.76,
      sourceUrl: "https://jobs.acme.io/o/grc-analyst",
    },
    {
      id: "8",
      date: d(1),
      type: "SOC 2",
      confidence: 0.94,
      sourceUrl: "https://status.acme.io/incidents/soc2-audit-kickoff",
    },
  ];
}

function decayCurvePoints(end: Date, spanDays: number): [number, number][] {
  const msDay = 24 * 60 * 60 * 1000;
  const start = end.getTime() - spanDays * msDay;
  const pts: [number, number][] = [];
  const steps = 48;
  for (let i = 0; i <= steps; i++) {
    const t = start + (i / steps) * spanDays * msDay;
    const ageDays = (end.getTime() - t) / msDay;
    const y = Math.exp(-(Math.LN2 / 12) * ageDays);
    pts.push([t, y]);
  }
  return pts;
}

export function SignalTimeline() {
  const [filter, setFilter] = useState<SignalTypeFilter>("All");
  const now = useMemo(() => new Date(), []);

  const allSignals = useMemo(() => buildMockSignals(now), [now]);
  const signals = useMemo(
    () => (filter === "All" ? allSignals : allSignals.filter((s) => s.type === filter)),
    [allSignals, filter]
  );

  const chartOption = useMemo<EChartsOption>(() => {
    const spanDays = 30;
    const scatterSeries: EChartsOption["series"] = (["SOC 2", "Security Hiring", "Trust Center", "ISO 27001"] as const).map(
      (type) => ({
        name: type,
        type: "scatter" as const,
        symbolSize: 10,
        itemStyle: { color: TYPE_COLOR[type], borderColor: COLORS.axis, borderWidth: 1 },
        emphasis: { scale: 1.25 },
        data: signals
          .filter((s) => s.type === type)
          .map((s) => [s.date.getTime(), s.confidence] as [number, number]),
      })
    );

    return {
      backgroundColor: "transparent",
      textStyle: { color: "#8888aa", fontFamily: "'JetBrains Mono', monospace", fontSize: 10 },
      grid: { left: 48, right: 24, top: 32, bottom: 40, borderColor: COLORS.grid },
      tooltip: {
        trigger: "item",
        backgroundColor: "#1e1e30",
        borderColor: "#2a2a40",
        textStyle: { color: "#d4d4e8", fontFamily: "'JetBrains Mono', monospace", fontSize: 11 },
        formatter: (params: unknown) => {
          const p = params as { value?: [number, number]; seriesName?: string };
          const v = p.value;
          if (!v || !Array.isArray(v)) return "";
          const [ts, conf] = v;
          const d = new Date(ts);
          const dateStr = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
          return `${p.seriesName ?? "Signal"}<br/>${dateStr}<br/>Confidence: ${(conf as number).toFixed(2)}`;
        },
      },
      legend: {
        bottom: 0,
        textStyle: { color: "#8888aa", fontSize: 10 },
        data: ["SOC 2", "Security Hiring", "Trust Center", "ISO 27001", "Freshness decay"],
      },
      xAxis: {
        type: "time",
        min: now.getTime() - spanDays * 24 * 60 * 60 * 1000,
        max: now.getTime(),
        axisLine: { lineStyle: { color: COLORS.axis } },
        axisTick: { lineStyle: { color: COLORS.axis } },
        axisLabel: { color: "#555570", fontSize: 9 },
        splitLine: { lineStyle: { color: COLORS.grid } },
      },
      yAxis: {
        type: "value",
        min: 0,
        max: 1,
        name: "Confidence",
        nameTextStyle: { color: "#8888aa", fontSize: 10 },
        axisLine: { lineStyle: { color: COLORS.axis } },
        axisTick: { lineStyle: { color: COLORS.axis } },
        axisLabel: { color: "#555570", fontSize: 9, formatter: (v: number) => v.toFixed(1) },
        splitLine: { lineStyle: { color: COLORS.grid } },
      },
      series: [
        ...scatterSeries,
        {
          name: "Freshness decay",
          type: "line",
          smooth: true,
          showSymbol: false,
          lineStyle: { color: COLORS.gold, width: 2, type: "dashed" },
          itemStyle: { color: COLORS.gold },
          data: decayCurvePoints(now, spanDays),
          z: 0,
        },
      ],
    };
  }, [signals, now]);

  const sortedTable = useMemo(
    () => [...signals].sort((a, b) => b.date.getTime() - a.date.getTime()),
    [signals]
  );

  return (
    <div className="flex flex-col gap-4">
      <Card className="border-border-default bg-bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-text-primary">Signal timeline</CardTitle>
          <p className="text-xs text-text-muted">
            Confidence by detection time; dashed curve shows exponential freshness decay (12-day half-life).
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {SIGNAL_TYPE_FILTERS.map((f) => (
              <Button
                key={f}
                type="button"
                variant={filter === f ? "default" : "outline"}
                size="sm"
                className={cn(
                  "h-7 font-mono text-[0.65rem]",
                  filter === f
                    ? "bg-syntax-builtin/20 text-syntax-builtin border-border-active"
                    : "border-border-default bg-bg-input text-text-secondary hover:bg-bg-card-hover"
                )}
                onClick={() => setFilter(f)}
              >
                {f}
              </Button>
            ))}
          </div>
          <EChartsWrapper option={chartOption} height={320} className="w-full min-w-0" />
        </CardContent>
      </Card>

      <Card className="border-border-default bg-bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-text-primary">Signal events</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[640px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-border-default bg-bg-input/50 font-mono text-[0.65rem] uppercase tracking-wider text-text-muted">
                <th className="px-4 py-2.5 font-semibold">Date</th>
                <th className="px-4 py-2.5 font-semibold">Signal type</th>
                <th className="px-4 py-2.5 font-semibold">Confidence</th>
                <th className="px-4 py-2.5 font-semibold">Source URL</th>
                <th className="px-4 py-2.5 font-semibold">Freshness weight</th>
              </tr>
            </thead>
            <tbody>
              {sortedTable.map((row) => {
                const fw = freshnessWeight(row.date, now);
                return (
                  <tr key={row.id} className="border-b border-border-default/80 hover:bg-bg-card-hover/60">
                    <td className="px-4 py-2.5 font-mono tabular-nums text-text-secondary">
                      {row.date.toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge
                        className="border"
                        style={{
                          backgroundColor: `${TYPE_COLOR[row.type]}18`,
                          color: TYPE_COLOR[row.type],
                          borderColor: `${TYPE_COLOR[row.type]}40`,
                        }}
                      >
                        {row.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-syntax-number tabular-nums">
                      {row.confidence.toFixed(2)}
                    </td>
                    <td className="max-w-[280px] truncate px-4 py-2.5 font-mono text-[0.65rem] text-syntax-string">
                      <a href={row.sourceUrl} className="hover:underline" target="_blank" rel="noreferrer">
                        {row.sourceUrl}
                      </a>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-[0.65rem] tabular-nums text-syntax-function">
                      {fw.toFixed(3)}
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
