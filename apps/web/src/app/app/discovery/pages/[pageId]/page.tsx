"use client";

import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MOCK_META = {
  url: "https://trust.nimbus-security.io/security-compliance/soc-2",
  fetchTime: "2025-03-25T14:22:08.431Z",
  statusCode: 200,
  contentType: "text/html; charset=utf-8",
  robotsAllowed: true,
  renderPath: "playwright" as const,
  pageType: "trust_compliance",
  pageTypeConfidence: 0.96,
};

const DETECTED_SIGNALS = [
  {
    type: "soc2_announced",
    confidence: 0.94,
    evidence: "We are pleased to announce the successful completion of our SOC 2 Type II examination",
    sourceLine: 42,
  },
  {
    type: "auditor_named",
    confidence: 0.89,
    evidence: "Independent attestation performed by Deloitte & Touche LLP",
    sourceLine: 58,
  },
  {
    type: "trust_center_asset",
    confidence: 0.91,
    evidence: "Download our latest SOC 2 report (PDF) from the Trust Center",
    sourceLine: 71,
  },
] as const;

export default function PageViewerPage() {
  const params = useParams();
  const pageId = typeof params.pageId === "string" ? params.pageId : "";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="route">{pageId || "—"}</Badge>
            <span className="text-xs text-text-muted font-mono">page_id</span>
          </div>
          <h1 className="font-mono text-lg font-bold text-text-primary">
            <span className="text-syntax-builtin">def</span>{" "}
            <span className="text-syntax-function">page_viewer</span>
            <span className="text-text-muted">(</span>
            <span className="text-syntax-class">Debug</span>
            <span className="text-text-muted">):</span>
          </h1>
          <p className="text-xs text-text-muted mt-1 max-w-2xl">
            Raw fetch metadata alongside cleaned body text. Inline badges mark
            spans the extractor promoted to signal candidates.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[320px]">
        <Card className="flex flex-col min-h-0">
          <CardHeader>
            <CardTitle>Raw metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm flex-1">
            <dl className="space-y-2.5">
              <div className="flex flex-col gap-0.5">
                <dt className="font-mono text-[0.6rem] uppercase tracking-wider text-text-muted">
                  URL
                </dt>
                <dd className="font-mono text-xs text-syntax-string break-all">
                  {MOCK_META.url}
                </dd>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <dt className="font-mono text-[0.6rem] uppercase tracking-wider text-text-muted">
                    Fetch time
                  </dt>
                  <dd className="font-mono text-xs text-text-primary mt-0.5">
                    {MOCK_META.fetchTime}
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[0.6rem] uppercase tracking-wider text-text-muted">
                    Status
                  </dt>
                  <dd className="mt-0.5">
                    <Badge variant="success">{MOCK_META.statusCode}</Badge>
                  </dd>
                </div>
              </div>
              <div>
                <dt className="font-mono text-[0.6rem] uppercase tracking-wider text-text-muted">
                  Content-Type
                </dt>
                <dd className="font-mono text-xs text-syntax-param mt-0.5">
                  {MOCK_META.contentType}
                </dd>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <dt className="font-mono text-[0.6rem] uppercase tracking-wider text-text-muted">
                    Robots allowed
                  </dt>
                  <dd className="mt-0.5">
                    <span
                      className={
                        MOCK_META.robotsAllowed
                          ? "text-accent-green font-mono text-xs"
                          : "text-accent-red font-mono text-xs"
                      }
                    >
                      {MOCK_META.robotsAllowed ? "yes" : "no"}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[0.6rem] uppercase tracking-wider text-text-muted">
                    Render path
                  </dt>
                  <dd className="mt-0.5">
                    <Badge variant="tech">
                      {MOCK_META.renderPath === "playwright"
                        ? "playwright"
                        : "static"}
                    </Badge>
                  </dd>
                </div>
              </div>
              <div>
                <dt className="font-mono text-[0.6rem] uppercase tracking-wider text-text-muted">
                  Page type
                </dt>
                <dd className="mt-1 flex flex-wrap items-center gap-2">
                  <Badge variant="discovery">{MOCK_META.pageType}</Badge>
                  <span className="font-mono text-xs text-syntax-decorator">
                    {(MOCK_META.pageTypeConfidence * 100).toFixed(0)}% conf
                  </span>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="flex flex-col min-h-0">
          <CardHeader>
            <CardTitle>Extracted text</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            <div className="rounded-lg border border-border-default bg-bg-input p-4 max-h-[420px] overflow-y-auto">
              <p className="font-mono text-xs text-text-secondary leading-relaxed whitespace-pre-wrap">
                Nimbus Security, Inc. — Security &amp; Compliance{"\n\n"}
                We are pleased to announce the successful completion of our{" "}
                <Badge variant="tech" className="mx-0.5 align-baseline">
                  SOC 2 Type II
                </Badge>{" "}
                examination for our cloud data protection platform, covering
                the period August 1, 2024 through January 31, 2025.{"\n\n"}
                Independent attestation was performed by{" "}
                <Badge variant="qualification" className="mx-0.5 align-baseline">
                  Deloitte &amp; Touche LLP
                </Badge>
                , in accordance with AICPA TSC criteria for Security,
                Availability, and Confidentiality.{"\n\n"}
                Customers and prospects may{" "}
                <Badge variant="info" className="mx-0.5 align-baseline">
                  download our latest SOC 2 report (PDF)
                </Badge>{" "}
                from the Trust Center after completing a brief NDA workflow.
                {"\n\n"}
                For questions about our control environment or subprocessors,
                contact{" "}
                <span className="text-syntax-string">
                  compliance@nimbus-security.io
                </span>
                .
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detected signals</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-default bg-bg-card/50">
                {[
                  "Signal type",
                  "Confidence",
                  "Evidence snippet",
                  "Source line",
                ].map((h) => (
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
              {DETECTED_SIGNALS.map((row) => (
                <tr
                  key={row.type}
                  className="border-b border-border-default hover:bg-bg-card/80 transition-colors"
                >
                  <td className="px-5 py-2.5">
                    <Badge variant="tech">{row.type.replace(/_/g, " ")}</Badge>
                  </td>
                  <td className="px-5 py-2.5">
                    <span
                      className={`font-mono text-xs font-semibold ${
                        row.confidence >= 0.9
                          ? "text-accent-green"
                          : row.confidence >= 0.85
                            ? "text-syntax-function"
                            : "text-accent-yellow"
                      }`}
                    >
                      {(row.confidence * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="px-5 py-2.5 text-xs text-text-secondary max-w-md">
                    {row.evidence}
                  </td>
                  <td className="px-5 py-2.5 font-mono text-xs text-syntax-param">
                    {row.sourceLine}
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
