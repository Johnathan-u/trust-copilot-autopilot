"use client";

import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";

const COMPANY_NAME = "Nimbus Security";
const GENERATED_DATE = "March 20, 2025";
const VALID_THROUGH = "June 30, 2025";
const TRUST_SCORE = 78;

const evidenceCards = [
  {
    title: "SOC 2 Type II",
    status: "Verified" as const,
    coverage: 92,
    finding: "All controls in place, 1 observation noted",
  },
  {
    title: "Security Policies",
    status: "Reviewed" as const,
    coverage: 85,
    finding: "3 policies need annual update",
  },
  {
    title: "Penetration Testing",
    status: "Current" as const,
    coverage: 100,
    finding: "No critical/high findings, 2 medium",
  },
  {
    title: "Vendor Management",
    status: "Gap" as const,
    coverage: 60,
    finding: "Missing vendor risk assessments for 4 critical vendors",
  },
];

const gapRows = [
  {
    domain: "SOC 2 Trust Criteria",
    current: 92,
    target: 95,
    gap: 3,
    priority: "P2",
    remediation: "Close observation CC6.1 with updated access review evidence.",
  },
  {
    domain: "Security Policies",
    current: 85,
    target: 95,
    gap: 10,
    priority: "P2",
    remediation: "Schedule policy owner review; publish v4 with annual attestations.",
  },
  {
    domain: "Penetration Testing",
    current: 100,
    target: 100,
    gap: 0,
    priority: "P3",
    remediation: "Maintain annual cadence; track medium findings to closure.",
  },
  {
    domain: "Vendor Management",
    current: 58,
    target: 90,
    gap: 32,
    priority: "P0",
    remediation: "Complete tier-1 vendor assessments; centralize SOC2 storage.",
  },
  {
    domain: "Access Management",
    current: 72,
    target: 90,
    gap: 18,
    priority: "P1",
    remediation: "Automate quarterly access reviews; align with IAM exports.",
  },
  {
    domain: "Data Retention & Deletion",
    current: 65,
    target: 85,
    gap: 20,
    priority: "P1",
    remediation: "Document retention schedules; add deletion attestation workflow.",
  },
];

function coverageTone(pct: number) {
  if (pct > 80) return "text-accent-green";
  if (pct >= 60) return "text-accent-yellow";
  return "text-accent-red";
}

function evidenceStatusBadge(status: (typeof evidenceCards)[number]["status"]) {
  switch (status) {
    case "Verified":
    case "Current":
      return <Badge variant="success">{status}</Badge>;
    case "Reviewed":
      return <Badge variant="info">{status}</Badge>;
    case "Gap":
      return <Badge variant="p0">{status}</Badge>;
    default:
      return <Badge variant="default">{status}</Badge>;
  }
}

export default function ProofPackPage() {
  const params = useParams<{ token: string }>();
  const token = typeof params.token === "string" ? params.token : "";

  return (
    <div className="min-h-screen bg-bg-root px-4 py-12 font-sans sm:px-6 md:py-16">
      <div className="mx-auto max-w-4xl">
        <header className="mb-10 text-center">
          <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-syntax-keyword">
            Trust Copilot
          </p>
          <h1 className="mt-4 font-mono text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
            Trust &amp; Compliance Proof Pack
          </h1>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <Badge variant="tech" className="normal-case tracking-normal">
              {COMPANY_NAME}
            </Badge>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-text-secondary">
            <span className="font-mono text-xs">
              Generated <span className="text-text-primary">{GENERATED_DATE}</span>
            </span>
            <span className="hidden text-text-muted sm:inline">·</span>
            <span className="font-mono text-xs">
              Valid through <span className="text-syntax-string">{VALID_THROUGH}</span>
            </span>
          </div>
          {token ? (
            <p className="mt-2 font-mono text-[0.6rem] text-text-muted">
              Pack ref: <span className="text-syntax-string">{token}</span>
            </p>
          ) : null}
        </header>

        <Card className="mb-10 border-border-default bg-bg-card">
          <CardHeader>
            <CardTitle className="text-syntax-class">Overall Trust Score</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-5xl font-semibold text-syntax-param">
                  {TRUST_SCORE}
                </span>
                <span className="font-mono text-lg text-text-muted">/100</span>
              </div>
              <Badge variant="warning" className="mb-1 normal-case">
                Strong — gaps remain
              </Badge>
            </div>
            <ProgressBar
              value={TRUST_SCORE}
              color="var(--color-syntax-class)"
              showLabel
            />
            <p className="text-sm leading-relaxed text-text-secondary">
              Score reflects evidence coverage across policies, attestations, and operational
              practices. Remediation priorities are summarized in the gap analysis below.
            </p>
          </CardContent>
        </Card>

        <section className="mb-10">
          <h2 className="mb-4 font-mono text-sm font-semibold uppercase tracking-wider text-syntax-builtin">
            Evidence summary
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {evidenceCards.map((item) => (
              <Card
                key={item.title}
                className="border-border-default bg-bg-editor transition-colors hover:bg-bg-card-hover"
              >
                <CardHeader className="flex-row flex-wrap items-center justify-between gap-2 border-b-0 pb-0">
                  <CardTitle className="text-base text-text-primary">{item.title}</CardTitle>
                  {evidenceStatusBadge(item.status)}
                </CardHeader>
                <CardContent className="space-y-3 pt-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-text-muted">Coverage</span>
                    <span
                      className={cn(
                        "font-mono text-sm font-semibold",
                        coverageTone(item.coverage)
                      )}
                    >
                      {item.coverage}%
                    </span>
                  </div>
                  <ProgressBar
                    value={item.coverage}
                    color={
                      item.coverage > 80
                        ? "var(--color-accent-green)"
                        : item.coverage >= 60
                          ? "var(--color-accent-yellow)"
                          : "var(--color-accent-red)"
                    }
                  />
                  <div>
                    <p className="font-mono text-[0.6rem] font-semibold uppercase tracking-wider text-text-muted">
                      Key finding
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                      {item.finding}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-mono text-sm font-semibold uppercase tracking-wider text-syntax-string">
            Gap analysis
          </h2>
          <Card className="border-border-default bg-bg-card overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border-default bg-bg-editor">
                      <th className="px-4 py-3 font-mono text-[0.6rem] font-semibold uppercase tracking-wider text-text-muted">
                        Domain
                      </th>
                      <th className="px-4 py-3 font-mono text-[0.6rem] font-semibold uppercase tracking-wider text-text-muted">
                        Current
                      </th>
                      <th className="px-4 py-3 font-mono text-[0.6rem] font-semibold uppercase tracking-wider text-text-muted">
                        Target
                      </th>
                      <th className="px-4 py-3 font-mono text-[0.6rem] font-semibold uppercase tracking-wider text-text-muted">
                        Gap
                      </th>
                      <th className="px-4 py-3 font-mono text-[0.6rem] font-semibold uppercase tracking-wider text-text-muted">
                        Priority
                      </th>
                      <th className="px-4 py-3 font-mono text-[0.6rem] font-semibold uppercase tracking-wider text-text-muted">
                        Remediation
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {gapRows.map((row) => (
                      <tr
                        key={row.domain}
                        className="border-b border-border-default last:border-0 hover:bg-bg-card-hover"
                      >
                        <td className="px-4 py-3 font-mono text-xs font-medium text-text-primary">
                          {row.domain}
                        </td>
                        <td
                          className={cn(
                            "px-4 py-3 font-mono text-xs font-semibold",
                            coverageTone(row.current)
                          )}
                        >
                          {row.current}%
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-text-secondary">
                          {row.target}%
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-text-secondary">
                          {row.gap}%
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              row.priority === "P0"
                                ? "p0"
                                : row.priority === "P1"
                                  ? "p1"
                                  : "default"
                            }
                          >
                            {row.priority}
                          </Badge>
                        </td>
                        <td className="max-w-[220px] px-4 py-3 text-xs leading-relaxed text-text-secondary">
                          {row.remediation}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

        <div className="flex justify-center">
          <Button type="button" size="lg" className="min-w-[260px]">
            Schedule Remediation Review
          </Button>
        </div>
      </div>
    </div>
  );
}
