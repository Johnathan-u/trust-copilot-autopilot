"use client";

import Link from "next/link";
import { Activity, AlertTriangle, Check, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";

const OVERALL_SCORE = 84;

const DOMAINS: {
  title: string;
  score: number;
  checks: { name: string; state: "pass" | "warn" | "fail" }[];
}[] = [
  {
    title: "Access Control",
    score: 92,
    checks: [
      { name: "MFA enabled", state: "pass" },
      { name: "RBAC configured", state: "pass" },
      { name: "Session timeouts", state: "pass" },
    ],
  },
  {
    title: "Data Protection",
    score: 88,
    checks: [
      { name: "Encryption at rest", state: "pass" },
      { name: "Backup schedule", state: "pass" },
      { name: "DLP rules", state: "pass" },
    ],
  },
  {
    title: "Incident Response",
    score: 76,
    checks: [
      { name: "Playbook defined", state: "pass" },
      { name: "Contact list", state: "pass" },
      { name: "Drill scheduled", state: "warn" },
    ],
  },
  {
    title: "Vendor Management",
    score: 70,
    checks: [
      { name: "Vendor registry", state: "pass" },
      { name: "Assessment schedule", state: "fail" },
      { name: "SLA tracking", state: "pass" },
    ],
  },
  {
    title: "Policy Management",
    score: 84,
    checks: [
      { name: "Policy repository", state: "pass" },
      { name: "Annual review", state: "pass" },
      { name: "Employee training", state: "pass" },
    ],
  },
];

const ISSUES = [
  {
    priority: "P1" as const,
    title: "Tabletop drill not scheduled",
    description:
      "Incident response domain is missing a dated drill. Schedule and attach evidence to close the gap.",
  },
  {
    priority: "P1" as const,
    title: "Vendor reassessment overdue",
    description:
      "Two critical vendors are past their annual assessment window. Complete questionnaires or upload attestations.",
  },
  {
    priority: "P2" as const,
    title: "Certificate expiring in 30 days",
    description:
      "ISO 27001 certificate enters renewal window next month. Upload the renewed cert when available.",
  },
];

function scoreBarColor(score: number): string {
  if (score >= 85) return "var(--color-accent-green)";
  if (score >= 70) return "var(--color-accent-yellow)";
  return "var(--color-accent-red)";
}

function scoreTextClass(score: number): string {
  if (score >= 85) return "text-accent-green";
  if (score >= 70) return "text-accent-yellow";
  return "text-accent-red";
}

function CheckRow({
  name,
  state,
}: {
  name: string;
  state: "pass" | "warn" | "fail";
}) {
  return (
    <div className="flex items-center gap-2.5 py-1.5 text-sm">
      {state === "pass" ? (
        <Check
          className="h-4 w-4 shrink-0 text-accent-green"
          strokeWidth={2.5}
          aria-hidden
        />
      ) : state === "warn" ? (
        <AlertTriangle
          className="h-4 w-4 shrink-0 text-accent-yellow"
          strokeWidth={2}
          aria-hidden
        />
      ) : (
        <X
          className="h-4 w-4 shrink-0 text-accent-red"
          strokeWidth={2.5}
          aria-hidden
        />
      )}
      <span
        className={cn(
          "text-text-secondary",
          state === "warn" && "text-accent-yellow",
          state === "fail" && "text-accent-red"
        )}
      >
        {name}
      </span>
    </div>
  );
}

export default function TrustRoomHealthPage() {
  const overallColor = scoreBarColor(OVERALL_SCORE);
  const overallText = scoreTextClass(OVERALL_SCORE);

  return (
    <div className="min-h-screen bg-bg-root font-sans text-text-primary">
      <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-syntax-class/30 bg-syntax-class/10 text-syntax-class">
              <Activity className="h-6 w-6" strokeWidth={1.5} aria-hidden />
            </div>
            <div>
              <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-text-muted">
                Trust Copilot
              </p>
              <h1 className="mt-1 font-mono text-2xl font-semibold tracking-tight text-text-primary md:text-3xl">
                Workspace health
              </h1>
              <p className="mt-2 text-sm text-text-secondary">
                Nimbus Security Trust Room — compliance domains, checks, and
                open issues at a glance.
              </p>
            </div>
          </div>
        </header>

        <nav
          className="mb-10 flex flex-wrap justify-center gap-1 border-b border-border-default sm:justify-start"
          aria-label="Workspace sections"
        >
          <Link
            href="/workspace"
            className="inline-flex border-b-2 border-transparent px-4 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-text-secondary transition-colors hover:text-text-primary"
          >
            Overview
          </Link>
          <Link
            href="/workspace/docs"
            className="inline-flex border-b-2 border-transparent px-4 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-text-secondary transition-colors hover:text-text-primary"
          >
            Documents
          </Link>
          <span className="inline-flex border-b-2 border-syntax-param px-4 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-syntax-param">
            Health
          </span>
        </nav>

        <Card className="mb-10 border-border-default bg-bg-editor">
          <CardContent className="flex flex-col items-center gap-6 py-10 md:py-12">
            <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-text-muted">
              Overall health score
            </p>
            <div
              className={cn(
                "flex h-40 w-40 items-center justify-center rounded-full border-4 bg-bg-card font-mono text-4xl font-bold tabular-nums shadow-[0_0_40px_rgba(0,0,0,0.35)] md:h-44 md:w-44 md:text-5xl",
                overallText,
                OVERALL_SCORE >= 85 && "border-accent-green/50",
                OVERALL_SCORE < 85 &&
                  OVERALL_SCORE >= 70 &&
                  "border-accent-yellow/50",
                OVERALL_SCORE < 70 && "border-accent-red/50"
              )}
            >
              {OVERALL_SCORE}
              <span className="ml-0.5 text-xl font-semibold text-text-muted md:text-2xl">
                /100
              </span>
            </div>
            <div className="w-full max-w-md">
              <ProgressBar value={OVERALL_SCORE} color={overallColor} />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-5 md:grid-cols-2">
          {DOMAINS.map((domain) => (
            <Card
              key={domain.title}
              className="border-border-default bg-bg-card hover:bg-bg-card-hover"
            >
              <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
                <CardTitle className="border-0 pb-0">{domain.title}</CardTitle>
                <span
                  className={cn(
                    "font-mono text-lg font-bold tabular-nums",
                    scoreTextClass(domain.score)
                  )}
                >
                  {domain.score}%
                </span>
              </CardHeader>
              <CardContent className="space-y-4">
                <ProgressBar
                  value={domain.score}
                  color={scoreBarColor(domain.score)}
                />
                <div className="divide-y divide-border-default/80 rounded-lg border border-border-default bg-bg-input/40 px-3">
                  {domain.checks.map((c) => (
                    <CheckRow key={c.name} name={c.name} state={c.state} />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <section className="mt-12">
          <h2 className="mb-4 font-mono text-sm font-semibold uppercase tracking-wider text-syntax-keyword">
            Issues requiring attention
          </h2>
          <div className="space-y-4">
            {ISSUES.map((issue) => (
              <Card
                key={issue.title}
                className="border-border-default bg-bg-editor"
              >
                <CardContent className="flex flex-col gap-3 py-5 sm:flex-row sm:items-start sm:gap-4">
                  <Badge
                    variant={issue.priority === "P1" ? "p0" : "p1"}
                    className="shrink-0"
                  >
                    {issue.priority}
                  </Badge>
                  <div>
                    <p className="font-mono text-sm font-semibold text-text-primary">
                      {issue.title}
                    </p>
                    <p className="mt-2 text-sm text-text-secondary">
                      {issue.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
