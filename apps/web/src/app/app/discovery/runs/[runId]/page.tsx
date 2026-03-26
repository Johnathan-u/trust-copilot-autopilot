"use client";

import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/ui/kpi-card";
import { formatNumber } from "@/lib/utils";

const MOCK_KPIS = {
  urlsFetched: 12_847,
  renderedPlaywright: 1_982,
  signalsExtracted: 3_421,
  errors: 47,
};

const STEP_ROWS = [
  {
    step: "robots.txt check",
    count: 1_204,
    success: 1_201,
    failed: 3,
    duration: "4.8s",
  },
  {
    step: "HTTP fetch",
    count: 12_847,
    success: 12_412,
    failed: 435,
    duration: "38m 12s",
  },
  {
    step: "JS render",
    count: 1_982,
    success: 1_964,
    failed: 18,
    duration: "2h 04m",
  },
  {
    step: "text extraction",
    count: 14_376,
    success: 14_329,
    failed: 47,
    duration: "12m 41s",
  },
  {
    step: "signal extraction",
    count: 14_329,
    success: 14_282,
    failed: 47,
    duration: "26m 03s",
  },
  {
    step: "dedup",
    count: 14_282,
    success: 14_235,
    failed: 47,
    duration: "3m 18s",
  },
] as const;

const SAMPLE_FAILURES = [
  {
    url: "https://jobs.example-corp.com/listings?q=security&page=99",
    status: 429,
    message: "Rate limited — Retry-After: 3600",
  },
  {
    url: "https://trust.nimbus-security.io/compliance/soc2-report.pdf",
    status: 403,
    message: "CloudFront: Request blocked (WAF)",
  },
  {
    url: "https://legacy.vendor.io/trust.html",
    status: 0,
    message: "net::ERR_CERT_DATE_INVALID",
  },
] as const;

export default function CrawlRunDetailPage() {
  const params = useParams();
  const runId = typeof params.runId === "string" ? params.runId : "";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="discovery">{runId || "—"}</Badge>
            <span className="text-xs text-text-muted font-mono">run_id</span>
          </div>
          <h1 className="font-mono text-lg font-bold text-text-primary">
            <span className="text-syntax-builtin">def</span>{" "}
            <span className="text-syntax-function">crawl_run</span>
            <span className="text-text-muted">(</span>
            <span className="text-syntax-class">Detail</span>
            <span className="text-text-muted">):</span>
          </h1>
          <p className="text-xs text-text-muted mt-1 max-w-xl">
            Single crawl execution — step counts, success vs failure, and sample
            transport errors for operator triage.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          label="URLs Fetched"
          value={formatNumber(MOCK_KPIS.urlsFetched)}
          sub="HTTP GET attempts (incl. redirects)"
          accent="blue"
        />
        <KpiCard
          label="Rendered (Playwright)"
          value={formatNumber(MOCK_KPIS.renderedPlaywright)}
          sub={`${((MOCK_KPIS.renderedPlaywright / MOCK_KPIS.urlsFetched) * 100).toFixed(1)}% of fetched`}
          accent="teal"
        />
        <KpiCard
          label="Signals Extracted"
          value={formatNumber(MOCK_KPIS.signalsExtracted)}
          sub="Structured candidates before merge"
          accent="green"
        />
        <KpiCard
          label="Errors"
          value={MOCK_KPIS.errors}
          sub="Non-retryable or exhausted retries"
          accent="red"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Step breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-default bg-bg-card/50">
                {["Step", "Count", "Success", "Failed", "Duration"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-2.5 text-left font-mono text-[0.6rem] font-semibold text-text-muted uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {STEP_ROWS.map((row) => (
                <tr
                  key={row.step}
                  className="border-b border-border-default hover:bg-bg-card/80 transition-colors"
                >
                  <td className="px-5 py-2.5 font-mono text-xs text-text-primary">
                    {row.step}
                  </td>
                  <td className="px-5 py-2.5 font-mono text-xs text-syntax-param">
                    {formatNumber(row.count)}
                  </td>
                  <td className="px-5 py-2.5 font-mono text-xs text-accent-green">
                    {formatNumber(row.success)}
                  </td>
                  <td className="px-5 py-2.5 font-mono text-xs text-accent-red">
                    {formatNumber(row.failed)}
                  </td>
                  <td className="px-5 py-2.5 font-mono text-[0.68rem] text-text-secondary">
                    {row.duration}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sample failures</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full table-fixed">
            <thead>
              <tr className="border-b border-border-default bg-bg-card/50">
                {["URL", "Status", "Error message"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-2.5 text-left font-mono text-[0.6rem] font-semibold text-text-muted uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SAMPLE_FAILURES.map((f, i) => (
                <tr
                  key={i}
                  className="border-b border-border-default last:border-0 hover:bg-bg-card/80 transition-colors"
                >
                  <td className="px-5 py-2.5 font-mono text-[0.65rem] text-syntax-string break-all align-top">
                    {f.url}
                  </td>
                  <td className="px-5 py-2.5 align-top w-24">
                    <Badge
                      variant={f.status === 0 ? "p0" : f.status >= 500 ? "p1" : "warning"}
                    >
                      {f.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-2.5 text-xs text-text-secondary align-top">
                    {f.message}
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
