"use client";

import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/ui/kpi-card";
import { EChartsWrapper } from "@/components/charts/echarts-wrapper";
import { cn } from "@/lib/utils";

const WEEKS = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"];

const COHORTS = [
  { cohort: "Week 1-4", accounts: 1840, conv: "3.8%", icp: "0.71", deal: "$42k", version: "v1.2.4" },
  { cohort: "Week 5-8", accounts: 1622, conv: "4.2%", icp: "0.74", deal: "$47k", version: "v1.2.4" },
  { cohort: "Week 9-12", accounts: 1510, conv: "4.9%", icp: "0.78", deal: "$51k", version: "v1.3.0" },
  { cohort: "Week 13-16", accounts: 1388, conv: "5.1%", icp: "0.79", deal: "$53k", version: "v1.3.0" },
];

function MatrixCell({
  label,
  count,
  className,
}: {
  label: string;
  count: number;
  className: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-border-default p-4 font-mono",
        className
      )}
    >
      <span className="text-[0.65rem] uppercase tracking-wider text-text-muted">{label}</span>
      <span className="mt-1 text-2xl font-bold text-text-primary">{count}</span>
    </div>
  );
}

export default function EvaluationDashboardPage() {
  const lineOption = useMemo<EChartsOption>(
    () => ({
      color: ["#569cd6", "#6a9955", "#dcdcaa"],
      legend: { data: ["Precision", "Recall", "F1"], top: 0 },
      grid: { left: 48, right: 16, top: 36, bottom: 28 },
      xAxis: {
        type: "category",
        data: WEEKS,
        axisLine: { lineStyle: { color: "#2a2a40" } },
        axisLabel: { color: "#555570", fontFamily: "'JetBrains Mono', monospace", fontSize: 10 },
      },
      yAxis: {
        type: "value",
        min: 0.72,
        max: 0.92,
        axisLine: { lineStyle: { color: "#2a2a40" } },
        splitLine: { lineStyle: { color: "#1e1e30" } },
        axisLabel: {
          color: "#555570",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          formatter: (v: number) => v.toFixed(2),
        },
      },
      tooltip: { trigger: "axis" },
      series: [
        { name: "Precision", type: "line", smooth: true, data: [0.78, 0.79, 0.8, 0.81, 0.82, 0.83, 0.84, 0.85] },
        { name: "Recall", type: "line", smooth: true, data: [0.74, 0.75, 0.76, 0.77, 0.78, 0.79, 0.8, 0.81] },
        { name: "F1", type: "line", smooth: true, data: [0.76, 0.77, 0.78, 0.79, 0.8, 0.81, 0.82, 0.83] },
      ],
    }),
    []
  );

  return (
    <div className="space-y-6 bg-bg-root min-h-full">
      <div>
        <h1 className="font-mono text-lg font-bold text-text-primary">
          <span className="text-syntax-builtin">def</span> evaluation_dashboard
          <span className="text-text-muted">(</span>
          <span className="text-syntax-class">Learn</span>
          <span className="text-text-muted">):</span>
        </h1>
        <p className="text-xs text-text-muted mt-1 font-mono">
          Offline metrics, cohort lift, and confusion at the conversion decision boundary.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Precision" value="0.847" sub="@0.5 threshold" accent="blue" />
        <KpiCard label="Recall" value="0.812" sub="@0.5 threshold" accent="green" />
        <KpiCard label="F1 Score" value="0.829" sub="macro" accent="purple" />
        <KpiCard label="AUC-ROC" value="0.901" sub="calibrated" accent="teal" />
      </div>

      <Card className="border-border-default bg-bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-mono text-sm text-text-primary">Model performance (8 weeks)</CardTitle>
        </CardHeader>
        <CardContent>
          <EChartsWrapper option={lineOption} height={280} />
        </CardContent>
      </Card>

      <Card className="border-border-default bg-bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-mono text-sm text-text-primary">Cohort comparison</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full font-mono text-xs">
              <thead>
                <tr className="border-b border-border-default bg-bg-editor text-left text-text-muted uppercase tracking-wider">
                  <th className="px-4 py-2 font-medium">Cohort</th>
                  <th className="px-4 py-2 font-medium">Accounts</th>
                  <th className="px-4 py-2 font-medium">Conversion</th>
                  <th className="px-4 py-2 font-medium">Avg ICP</th>
                  <th className="px-4 py-2 font-medium">Avg Deal</th>
                  <th className="px-4 py-2 font-medium">Model</th>
                </tr>
              </thead>
              <tbody className="text-text-secondary">
                {COHORTS.map((c) => (
                  <tr key={c.cohort} className="border-b border-border-default hover:bg-bg-card-hover/50">
                    <td className="px-4 py-2.5 text-text-primary">{c.cohort}</td>
                    <td className="px-4 py-2.5">{c.accounts.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-syntax-class">{c.conv}</td>
                    <td className="px-4 py-2.5 text-syntax-param">{c.icp}</td>
                    <td className="px-4 py-2.5 text-syntax-string">{c.deal}</td>
                    <td className="px-4 py-2.5">
                      <Badge variant="tech">{c.version}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border-default bg-bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-mono text-sm text-text-primary">Confusion matrix</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-xs text-text-muted font-mono">Binary convert @ calibrated threshold</p>
            <div className="grid grid-cols-2 gap-2">
              <MatrixCell label="True Positive" count={428} className="bg-syntax-builtin/10" />
              <MatrixCell label="False Positive" count={76} className="bg-accent-red/10" />
              <MatrixCell label="False Negative" count={94} className="bg-accent-yellow/10" />
              <MatrixCell label="True Negative" count={1388} className="bg-syntax-class/10" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border-default bg-bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-mono text-sm text-text-primary">Version comparison</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between rounded-lg border border-border-default bg-bg-editor px-3 py-2">
              <span className="text-text-muted">Current</span>
              <Badge variant="success">v1.3.0</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border-default bg-bg-input px-3 py-2">
              <span className="text-text-muted">Previous</span>
              <span className="text-text-secondary">v1.2.4</span>
            </div>
            <div className="space-y-2 border-t border-border-default pt-3">
              {[
                { m: "Precision", d: "+0.012", up: true },
                { m: "Recall", d: "+0.008", up: true },
                { m: "F1", d: "+0.011", up: true },
                { m: "AUC-ROC", d: "-0.003", up: false },
              ].map((row) => (
                <div key={row.m} className="flex items-center justify-between text-text-secondary">
                  <span>{row.m}</span>
                  <span className={row.up ? "text-accent-green" : "text-accent-red"}>{row.d}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
