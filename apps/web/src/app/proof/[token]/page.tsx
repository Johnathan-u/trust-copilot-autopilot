"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";

const COMPANY_NAME = "Nimbus Security";
const GENERATED_DATE = "March 18, 2025";
const READINESS_SCORE = 72;

const complianceItems = [
  {
    name: "SOC 2 Type II",
    status: "In Progress" as const,
    note: "Control narratives drafted; evidence collection in flight for Q2 audit window.",
  },
  {
    name: "ISO 27001",
    status: "Gap" as const,
    note: "ISMS scope and SoA need alignment with current product boundaries.",
  },
  {
    name: "GDPR",
    status: "Ready" as const,
    note: "DPA templates, subprocessors, and ROPA maintained in Trust Center.",
  },
  {
    name: "HIPAA",
    status: "Gap" as const,
    note: "BAA coverage and PHI data flows not yet mapped for healthcare pilots.",
  },
];

const competitors = [
  {
    name: "Vanta",
    impact:
      "Strong automation narrative in your segment; buyers compare questionnaire velocity head-to-head.",
  },
  {
    name: "Drata",
    impact:
      "Similar SOC 2 positioning—differentiate on incident storytelling and vendor depth.",
  },
  {
    name: "Secureframe",
    impact:
      "Emerging in mid-market RFPs; your Trust Center freshness can offset feature parity concerns.",
  },
];

const recommendedActions = [
  {
    step: 1,
    title: "Close SOC 2 evidence gaps",
    priority: "P0" as const,
    detail: "Prioritize access reviews, change management tickets, and vendor SOC reports.",
  },
  {
    step: 2,
    title: "Publish ISO-aligned policy set",
    priority: "P1" as const,
    detail: "Map Annex A controls to owned docs and link from the public Trust Center.",
  },
  {
    step: 3,
    title: "Run vendor tier-1 reassessment",
    priority: "P1" as const,
    detail: "Refresh security reviews for top five subprocessors before renewal season.",
  },
];

function complianceBadge(status: (typeof complianceItems)[number]["status"]) {
  switch (status) {
    case "Ready":
      return <Badge variant="success">{status}</Badge>;
    case "In Progress":
      return <Badge variant="warning">{status}</Badge>;
    case "Gap":
      return <Badge variant="p0">{status}</Badge>;
    default:
      return <Badge variant="default">{status}</Badge>;
  }
}

export default function ProofOfValuePage() {
  const params = useParams<{ token: string }>();
  const token = params.token;

  return (
    <div className="min-h-screen bg-bg-root px-4 py-12 font-sans sm:px-6 md:py-16">
      <div className="mx-auto max-w-2xl">
        <header className="mb-10 text-center">
          <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-syntax-keyword">
            Trust Copilot
          </p>
          <h1 className="mt-3 font-mono text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
            Your Trust &amp; Compliance Assessment
          </h1>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <Badge variant="tech" className="normal-case tracking-normal">
              {COMPANY_NAME}
            </Badge>
            <span className="text-text-muted">·</span>
            <span className="font-mono text-xs text-text-secondary">
              Generated {GENERATED_DATE}
            </span>
          </div>
          <p className="mt-2 font-mono text-[0.65rem] text-text-muted">
            Ref: <span className="text-syntax-string">{token}</span>
          </p>
        </header>

        <div className="space-y-6">
          <Card className="border-border-default bg-bg-editor">
            <CardHeader>
              <CardTitle className="text-syntax-class">
                Trust Readiness Score
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-end gap-4">
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-5xl font-semibold text-syntax-param">
                    {READINESS_SCORE}
                  </span>
                  <span className="font-mono text-lg text-text-muted">/100</span>
                </div>
                <Badge variant="success" className="mb-1">
                  Good
                </Badge>
              </div>
              <ProgressBar value={READINESS_SCORE} color="var(--color-syntax-class)" />
              <ul className="space-y-2 text-sm leading-relaxed text-text-secondary">
                <li className="flex gap-2">
                  <span className="font-mono text-accent-green">▸</span>
                  Policies and subprocessors are visible; evidence trails need tighter linkage.
                </li>
                <li className="flex gap-2">
                  <span className="font-mono text-accent-green">▸</span>
                  Incident response runbooks exist but tabletop exercises are not documented.
                </li>
                <li className="flex gap-2">
                  <span className="font-mono text-accent-green">▸</span>
                  Vendor reviews cover tier-1 tools; tier-2 SaaS still on spreadsheet tracking.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border-default bg-bg-editor">
            <CardHeader>
              <CardTitle className="text-syntax-builtin">
                Compliance Gap Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {complianceItems.map((row) => (
                <div
                  key={row.name}
                  className="rounded-lg border border-border-default bg-bg-card px-4 py-3 transition-colors hover:bg-bg-card-hover"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-sm font-medium text-text-primary">
                      {row.name}
                    </span>
                    {complianceBadge(row.status)}
                  </div>
                  <p className="mt-2 text-sm text-text-secondary">{row.note}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border-default bg-bg-editor">
            <CardHeader>
              <CardTitle className="text-syntax-string">
                Competitive Landscape
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {competitors.map((c) => (
                <div
                  key={c.name}
                  className="rounded-lg border border-border-default bg-bg-card px-4 py-3"
                >
                  <p className="font-mono text-sm font-semibold text-syntax-class">
                    {c.name}
                  </p>
                  <p className="mt-1.5 text-sm text-text-secondary">{c.impact}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border-default bg-bg-editor">
            <CardHeader>
              <CardTitle className="text-syntax-keyword">
                Recommended Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recommendedActions.map((a) => (
                <div
                  key={a.step}
                  className="flex gap-4 rounded-lg border border-border-default bg-bg-card px-4 py-3"
                >
                  <span className="font-mono text-sm font-semibold text-text-muted">
                    {a.step}.
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-mono text-sm font-medium text-text-primary">
                        {a.title}
                      </p>
                      <Badge
                        variant={a.priority === "P0" ? "p0" : "p1"}
                        className="text-[0.55rem]"
                      >
                        {a.priority}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-text-secondary">{a.detail}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button size="lg" className="h-11 min-w-[220px]">
            Schedule a Deep Dive
          </Button>
          <Link
            href={`/proof/${token}/summary`}
            className={cn(
              "font-mono text-xs font-medium uppercase tracking-wide text-syntax-param",
              "underline-offset-4 hover:underline"
            )}
          >
            View Full Summary
          </Link>
        </div>
      </div>
    </div>
  );
}
