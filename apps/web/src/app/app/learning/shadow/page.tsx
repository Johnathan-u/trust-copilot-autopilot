"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/ui/kpi-card";
import { cn } from "@/lib/utils";

const DISAGREEMENTS = [
  { account: "Helios Data Co.", prod: 0.82, shadow: 0.64, prodL: "Interested", shadowL: "Not Now" },
  { account: "Blue River AI", prod: 0.41, shadow: 0.78, prodL: "Not Fit", shadowL: "Interested" },
  { account: "Kite Security", prod: 0.71, shadow: 0.69, prodL: "Interested", shadowL: "Converted" },
  { account: "Orbital SaaS", prod: 0.55, shadow: 0.44, prodL: "Not Now", shadowL: "Not Fit" },
  { account: "Cedar Health", prod: 0.88, shadow: 0.91, prodL: "Interested", shadowL: "Converted" },
  { account: "Nimbus FinTech", prod: 0.36, shadow: 0.52, prodL: "Invalid", shadowL: "Not Now" },
];

function DeltaRow({
  label,
  prod,
  shadow,
  format = "float3" as "float3" | "pp",
}: {
  label: string;
  prod: string;
  shadow: string;
  format?: "float3" | "pp";
}) {
  const p = parseFloat(prod.replace("%", ""));
  const s = parseFloat(shadow.replace("%", ""));
  const up = s >= p;
  const raw = s - p;
  const diff =
    format === "pp" ? `${raw >= 0 ? "+" : ""}${raw.toFixed(1)} pp` : `${raw >= 0 ? "+" : ""}${raw.toFixed(3)}`;
  return (
    <div className="flex items-center justify-between font-mono text-xs">
      <span className="text-text-muted">{label}</span>
      <span className="flex items-center gap-1.5 text-text-secondary">
        <span className="text-syntax-param">{prod}</span>
        <span className="text-text-muted">→</span>
        <span className="text-syntax-string">{shadow}</span>
        {up ? (
          <ArrowUp className="size-3.5 text-accent-green shrink-0" aria-hidden />
        ) : (
          <ArrowDown className="size-3.5 text-accent-red shrink-0" aria-hidden />
        )}
        <span className={cn("tabular-nums", up ? "text-accent-green" : "text-accent-red")}>{diff}</span>
      </span>
    </div>
  );
}

export default function ShadowScoringPage() {
  return (
    <div className="space-y-6 bg-bg-root min-h-full">
      <div>
        <h1 className="font-mono text-lg font-bold text-text-primary">
          <span className="text-syntax-builtin">def</span> shadow_scoring
          <span className="text-text-muted">(</span>
          <span className="text-syntax-class">Compare</span>
          <span className="text-text-muted">):</span>
        </h1>
        <p className="mt-2 max-w-2xl text-xs text-text-secondary font-mono leading-relaxed">
          Compare production model predictions against shadow (candidate model). Disagreements are prioritized for
          human review before promotion.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border-default bg-bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="font-mono text-sm text-syntax-builtin">Production Model</CardTitle>
            <p className="font-mono text-[0.65rem] uppercase tracking-wider text-text-muted">v1.2 — live traffic</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <KpiCard label="Accuracy" value="81.2%" accent="blue" />
              <KpiCard label="Precision" value="0.831" accent="teal" />
              <KpiCard label="Recall" value="0.798" accent="green" />
              <KpiCard label="F1" value="0.814" accent="purple" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border-default bg-bg-card ring-1 ring-syntax-keyword/20">
          <CardHeader className="pb-2">
            <CardTitle className="font-mono text-sm text-syntax-keyword">Shadow Model</CardTitle>
            <p className="font-mono text-[0.65rem] uppercase tracking-wider text-text-muted">v1.3 — shadow traffic</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <KpiCard label="Accuracy" value="83.4%" accent="blue" />
              <KpiCard label="Precision" value="0.846" accent="teal" />
              <KpiCard label="Recall" value="0.812" accent="green" />
              <KpiCard label="F1" value="0.829" accent="purple" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border-default bg-bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-mono text-sm text-text-primary">Metric deltas (shadow − production)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <DeltaRow label="Accuracy" prod="81.2%" shadow="83.4%" format="pp" />
          <DeltaRow label="Precision" prod="0.831" shadow="0.846" />
          <DeltaRow label="Recall" prod="0.798" shadow="0.812" />
          <DeltaRow label="F1" prod="0.814" shadow="0.829" />
        </CardContent>
      </Card>

      <Card className="border-border-default bg-bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-mono text-sm text-text-primary">Disagreement sample</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full font-mono text-xs">
              <thead>
                <tr className="border-b border-border-default bg-bg-editor text-left text-text-muted uppercase tracking-wider">
                  <th className="px-4 py-2 font-medium">Account</th>
                  <th className="px-4 py-2 font-medium">Prod score</th>
                  <th className="px-4 py-2 font-medium">Shadow</th>
                  <th className="px-4 py-2 font-medium">Delta</th>
                  <th className="px-4 py-2 font-medium">Prod label</th>
                  <th className="px-4 py-2 font-medium">Shadow label</th>
                </tr>
              </thead>
              <tbody className="text-text-secondary">
                {DISAGREEMENTS.map((r) => {
                  const delta = r.shadow - r.prod;
                  return (
                    <tr key={r.account} className="border-b border-border-default hover:bg-bg-card-hover/50">
                      <td className="px-4 py-2.5 text-text-primary">{r.account}</td>
                      <td className="px-4 py-2.5 text-syntax-param">{r.prod.toFixed(2)}</td>
                      <td className="px-4 py-2.5 text-syntax-string">{r.shadow.toFixed(2)}</td>
                      <td
                        className={cn(
                          "px-4 py-2.5 tabular-nums",
                          delta >= 0 ? "text-accent-green" : "text-accent-red"
                        )}
                      >
                        {delta >= 0 ? "+" : ""}
                        {delta.toFixed(2)}
                      </td>
                      <td className="px-4 py-2.5">{r.prodL}</td>
                      <td className="px-4 py-2.5">{r.shadowL}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="outline" className="font-mono">
          Promote Shadow Model
        </Button>
      </div>
    </div>
  );
}
