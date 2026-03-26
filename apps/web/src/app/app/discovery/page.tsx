"use client";

import { KpiCard } from "@/components/ui/kpi-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/utils";

const MOCK_STATS = {
  pagesPerDay: 847_293,
  signalsPerDay: 62_481,
  sourcesActive: 142,
  crawlBacklog: 23_847,
  freshness: 0.87,
  dedupeRate: 0.34,
};

const SOURCE_MIX = [
  { name: "Company sites", count: 58, pct: 41, color: "var(--color-syntax-builtin)" },
  { name: "Job boards", count: 34, pct: 24, color: "var(--color-syntax-keyword)" },
  { name: "RSS / News", count: 28, pct: 20, color: "var(--color-syntax-string)" },
  { name: "Trust pages", count: 22, pct: 15, color: "var(--color-syntax-class)" },
];

const RECENT_SIGNALS = [
  { company: "Acme Corp", signal: "soc2_announced", confidence: 0.94, age: "2h ago" },
  { company: "TechStart Inc", signal: "security_hiring", confidence: 0.88, age: "3h ago" },
  { company: "DataFlow Ltd", signal: "trust_center_launched", confidence: 0.91, age: "4h ago" },
  { company: "CloudPeak", signal: "iso27001_mentioned", confidence: 0.86, age: "5h ago" },
  { company: "FinGuard", signal: "compliance_funding", confidence: 0.92, age: "6h ago" },
];

export default function DiscoveryPage() {
  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Pages / Day"
          value={formatNumber(MOCK_STATS.pagesPerDay)}
          sub="Target: 1M"
          accent="blue"
        />
        <KpiCard
          label="Signals / Day"
          value={formatNumber(MOCK_STATS.signalsPerDay)}
          sub="13 signal types"
          accent="green"
        />
        <KpiCard
          label="Active Sources"
          value={MOCK_STATS.sourcesActive}
          sub="3 paused"
          accent="teal"
        />
        <KpiCard
          label="Crawl Backlog"
          value={formatNumber(MOCK_STATS.crawlBacklog)}
          sub="Queue depth"
          accent="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Source Mix</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {SOURCE_MIX.map((source) => (
              <div key={source.name} className="flex items-center gap-3">
                <span className="font-mono text-xs text-text-secondary w-28 truncate">
                  {source.name}
                </span>
                <ProgressBar
                  value={source.pct}
                  color={source.color}
                  className="flex-1"
                />
                <span className="font-mono text-[0.65rem] text-text-muted w-16 text-right">
                  {source.count} sources
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pipeline Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">Content freshness</span>
              <div className="flex items-center gap-2">
                <ProgressBar
                  value={MOCK_STATS.freshness * 100}
                  color="var(--color-accent-green)"
                  className="w-24"
                />
                <span className="font-mono text-xs text-accent-green font-semibold">
                  {(MOCK_STATS.freshness * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">Dedupe rate</span>
              <div className="flex items-center gap-2">
                <ProgressBar
                  value={MOCK_STATS.dedupeRate * 100}
                  color="var(--color-syntax-keyword)"
                  className="w-24"
                />
                <span className="font-mono text-xs text-syntax-keyword font-semibold">
                  {(MOCK_STATS.dedupeRate * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">Throughput target</span>
              <div className="flex items-center gap-2">
                <ProgressBar
                  value={(MOCK_STATS.pagesPerDay / 1_000_000) * 100}
                  color="var(--color-syntax-builtin)"
                  className="w-24"
                />
                <span className="font-mono text-xs text-syntax-builtin font-semibold">
                  {((MOCK_STATS.pagesPerDay / 1_000_000) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Signals</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-default">
                <th className="px-5 py-2 text-left font-mono text-[0.6rem] font-semibold text-text-muted uppercase tracking-wider">Company</th>
                <th className="px-5 py-2 text-left font-mono text-[0.6rem] font-semibold text-text-muted uppercase tracking-wider">Signal</th>
                <th className="px-5 py-2 text-left font-mono text-[0.6rem] font-semibold text-text-muted uppercase tracking-wider">Confidence</th>
                <th className="px-5 py-2 text-left font-mono text-[0.6rem] font-semibold text-text-muted uppercase tracking-wider">Age</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_SIGNALS.map((sig, i) => (
                <tr
                  key={i}
                  className="border-b border-border-default hover:bg-bg-card transition-colors cursor-pointer"
                >
                  <td className="px-5 py-2.5 font-mono text-xs text-text-primary font-medium">
                    {sig.company}
                  </td>
                  <td className="px-5 py-2.5">
                    <Badge variant="tech">{sig.signal.replace(/_/g, " ")}</Badge>
                  </td>
                  <td className="px-5 py-2.5">
                    <span
                      className="font-mono text-xs font-semibold"
                      style={{
                        color:
                          sig.confidence >= 0.9
                            ? "var(--color-accent-green)"
                            : sig.confidence >= 0.8
                              ? "var(--color-syntax-function)"
                              : "var(--color-accent-yellow)",
                      }}
                    >
                      {(sig.confidence * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="px-5 py-2.5 font-mono text-[0.68rem] text-text-muted">
                    {sig.age}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
