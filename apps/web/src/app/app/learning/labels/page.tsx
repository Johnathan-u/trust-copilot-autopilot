"use client";

import { useMemo } from "react";
import { Check, X } from "lucide-react";
import type { EChartsOption } from "echarts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/ui/kpi-card";
import { EChartsWrapper } from "@/components/charts/echarts-wrapper";

const LABELS = [
  "Converted",
  "Interested",
  "Not Now",
  "Not Fit",
  "Competitor",
  "Invalid",
] as const;

const RECENT = [
  { account: "Northwind Labs", predicted: "Interested", human: "Interested", agree: true, by: "alex@tc.io", date: "2025-03-24" },
  { account: "Acme Corp", predicted: "Converted", human: "Not Now", agree: false, by: "sam@tc.io", date: "2025-03-24" },
  { account: "Globex Systems", predicted: "Not Fit", human: "Not Fit", agree: true, by: "alex@tc.io", date: "2025-03-23" },
  { account: "Initech", predicted: "Interested", human: "Competitor", agree: false, by: "jordan@tc.io", date: "2025-03-23" },
  { account: "Umbrella Bio", predicted: "Converted", human: "Converted", agree: true, by: "sam@tc.io", date: "2025-03-22" },
  { account: "Stark Ind.", predicted: "Invalid", human: "Interested", agree: false, by: "alex@tc.io", date: "2025-03-22" },
  { account: "Wayne Ent.", predicted: "Not Now", human: "Not Now", agree: true, by: "jordan@tc.io", date: "2025-03-21" },
  { account: "Cyberdyne", predicted: "Not Fit", human: "Invalid", agree: false, by: "sam@tc.io", date: "2025-03-21" },
];

export default function OutcomeLabelsPage() {
  const distOption = useMemo<EChartsOption>(
    () => ({
      color: ["#569cd6", "#4ec9b0", "#c586c0", "#ce9178", "#6a9955", "#dcdcaa"],
      tooltip: { trigger: "item" },
      legend: {
        orient: "vertical",
        right: 8,
        top: "center",
        textStyle: { color: "#8888aa", fontSize: 10 },
      },
      series: [
        {
          type: "pie",
          radius: ["42%", "68%"],
          center: ["38%", "50%"],
          avoidLabelOverlap: true,
          label: { color: "#d4d4e8", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" },
          data: [
            { value: 312, name: "Converted" },
            { value: 428, name: "Interested" },
            { value: 186, name: "Not Now" },
            { value: 94, name: "Not Fit" },
            { value: 52, name: "Competitor" },
            { value: 38, name: "Invalid" },
          ],
        },
      ],
    }),
    []
  );

  return (
    <div className="space-y-6 bg-bg-root min-h-full">
      <div>
        <h1 className="font-mono text-lg font-bold text-text-primary">
          <span className="text-syntax-builtin">def</span> labeling_console
          <span className="text-text-muted">(</span>
          <span className="text-syntax-class">Train</span>
          <span className="text-text-muted">):</span>
        </h1>
        <p className="text-xs text-text-muted mt-1 font-mono">
          Human review queue for lead outcomes — trains the ranking model.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Labeled" value="1,847" sub="last 30d" accent="blue" />
        <KpiCard label="Unlabeled Queue" value="124" sub="awaiting review" accent="orange" />
        <KpiCard label="Agreement Rate" value="87.4%" sub="human vs model" accent="teal" />
        <KpiCard label="Model Accuracy" value="82.1%" sub="held-out eval" accent="green" />
      </div>

      <Card className="border-border-default bg-bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-mono text-sm text-text-primary">Labeling queue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-border-default bg-bg-editor p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="font-mono text-sm font-semibold text-syntax-string">Vertex Analytics Inc.</div>
                <p className="mt-1 text-xs text-text-secondary font-mono max-w-xl">
                  Signals:{" "}
                  <span className="text-syntax-class">SOC2 Type II</span>
                  <span className="text-text-muted"> · </span>
                  <span className="text-syntax-class">Series B</span>
                  <span className="text-text-muted"> · </span>
                  <span className="text-syntax-class">Hiring SRE</span>
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="discovery">ICP 0.86</Badge>
                  <Badge variant="default">Prediction: Interested (0.71)</Badge>
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {LABELS.map((l) => (
                <Button key={l} variant="outline" size="sm" className="font-mono text-[0.65rem]">
                  {l}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border-default bg-bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-mono text-sm text-text-primary">Recent labels</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full font-mono text-xs">
              <thead>
                <tr className="border-b border-border-default bg-bg-editor text-left text-text-muted uppercase tracking-wider">
                  <th className="px-4 py-2 font-medium">Account</th>
                  <th className="px-4 py-2 font-medium">Predicted</th>
                  <th className="px-4 py-2 font-medium">Human</th>
                  <th className="px-4 py-2 font-medium">Agreement</th>
                  <th className="px-4 py-2 font-medium">Labeled By</th>
                  <th className="px-4 py-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="text-text-secondary">
                {RECENT.map((row) => (
                  <tr key={row.account} className="border-b border-border-default hover:bg-bg-card-hover/50">
                    <td className="px-4 py-2.5 text-text-primary">{row.account}</td>
                    <td className="px-4 py-2.5 text-syntax-param">{row.predicted}</td>
                    <td className="px-4 py-2.5 text-syntax-string">{row.human}</td>
                    <td className="px-4 py-2.5">
                      {row.agree ? (
                        <Check className="size-4 text-accent-green" aria-label="agree" />
                      ) : (
                        <X className="size-4 text-accent-red" aria-label="disagree" />
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-text-muted">{row.by}</td>
                    <td className="px-4 py-2.5 text-text-muted">{row.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border-default bg-bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-mono text-sm text-text-primary">Label distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <EChartsWrapper option={distOption} height={260} />
        </CardContent>
      </Card>
    </div>
  );
}
