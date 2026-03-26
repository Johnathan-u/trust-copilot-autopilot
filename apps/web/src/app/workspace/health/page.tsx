"use client";

import Link from "next/link";
import { Activity, AlertTriangle, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";

const OVERALL_SCORE = 84;

const EXPIRING_DOCS = [
  { name: "ISO 27001 Certificate", days: 5, expiry: "Mar 30, 2025" },
  { name: "Incident Response Playbook", days: 18, expiry: "Apr 12, 2025" },
  { name: "Access Control Evidence Export", days: 178, expiry: "Sep 18, 2025" },
] as const;

const RETENTION_NUDGES = [
  {
    title: "Schedule penetration test",
    detail: "Annual test window — due in 23 days.",
    tone: "warn" as const,
  },
  {
    title: "Update incident response plan",
    detail: "Last updated 11 months ago. Annual review recommended.",
    tone: "warn" as const,
  },
  {
    title: "Complete vendor reassessments",
    detail: "2 critical vendors are inside the 90-day renewal window.",
    tone: "bad" as const,
  },
  {
    title: "Publish Q1 trust center changelog",
    detail: "Buyers viewed your center 48 times last month without updates.",
    tone: "info" as const,
  },
] as const;

const TIMELINE = [
  { date: "Apr 2, 2025", title: "Security Assessment Q3 due", body: "Submit remaining evidence to Acme Procurement." },
  { date: "Apr 18, 2025", title: "Vendor due diligence deadline", body: "Northwind Legal questionnaire completion." },
  { date: "May 5, 2025", title: "SOC 2 readiness review", body: "Internal audit readout and gap summary." },
  { date: "Jun 1, 2025", title: "Policy attestation cycle", body: "Employee acknowledgment for updated policies." },
] as const;

const DOMAINS: {
  title: string;
  score: number;
  checks: { name: string; state: "pass" | "warn" | "fail" }[];
}[] = [
  {
    title: "Access Control",
    score: 92,
    checks: [
      { name: "MFA enforced org-wide", state: "pass" },
      { name: "RBAC quarterly review", state: "pass" },
      { name: "Privileged access reviews", state: "warn" },
    ],
  },
  {
    title: "Data Protection",
    score: 88,
    checks: [
      { name: "Encryption at rest", state: "pass" },
      { name: "Backup & restore tested", state: "pass" },
      { name: "DLP coverage — SaaS", state: "pass" },
    ],
  },
  {
    title: "Incident Response",
    score: 76,
    checks: [
      { name: "Playbook & contacts", state: "pass" },
      { name: "Tabletop drill scheduled", state: "warn" },
      { name: "Post-incident templates", state: "pass" },
    ],
  },
  {
    title: "Vendor Management",
    score: 70,
    checks: [
      { name: "Vendor registry current", state: "pass" },
      { name: "Annual assessments on schedule", state: "fail" },
      { name: "Subprocessor disclosures", state: "warn" },
    ],
  },
  {
    title: "Policy Management",
    score: 84,
    checks: [
      { name: "Central policy repository", state: "pass" },
      { name: "Version history & approvals", state: "pass" },
      { name: "Training attestation", state: "pass" },
    ],
  },
];

function urgencyForDays(days: number): { label: string; variant: "p0" | "p1" | "success" } {
  if (days < 7) return { label: "Urgent", variant: "p0" };
  if (days < 30) return { label: "Warning", variant: "p1" };
  return { label: "OK", variant: "success" };
}

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

function CheckRow({ name, state }: { name: string; state: "pass" | "warn" | "fail" }) {
  return (
    <div className="flex items-center gap-2.5 py-1.5 text-sm">
      {state === "pass" ? (
        <Check className="h-4 w-4 shrink-0 text-accent-green" strokeWidth={2.5} aria-hidden />
      ) : state === "warn" ? (
        <AlertTriangle className="h-4 w-4 shrink-0 text-accent-yellow" strokeWidth={2} aria-hidden />
      ) : (
        <X className="h-4 w-4 shrink-0 text-accent-red" strokeWidth={2.5} aria-hidden />
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

export default function WorkspaceHealthPage() {
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
                Retention nudges, expiring documents, and domain-level readiness for Nimbus Security.
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
                "flex items-baseline justify-center gap-1 font-mono font-bold tabular-nums",
                overallText
              )}
            >
              <span className="text-5xl md:text-6xl">{OVERALL_SCORE}</span>
              <span className="text-2xl font-semibold text-text-muted md:text-3xl">/100</span>
            </div>
            <div className="w-full max-w-md">
              <ProgressBar value={OVERALL_SCORE} color={overallColor} />
            </div>
          </CardContent>
        </Card>

        <section className="mb-10">
          <h2 className="mb-4 font-mono text-sm font-semibold uppercase tracking-wider text-syntax-keyword">
            Expiring documents
          </h2>
          <div className="space-y-3">
            {EXPIRING_DOCS.map((d) => {
              const u = urgencyForDays(d.days);
              return (
                <Card key={d.name} className="border-border-default bg-bg-card hover:bg-bg-card-hover">
                  <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-mono text-sm font-semibold text-text-primary">{d.name}</p>
                      <p className="mt-1 font-mono text-xs text-text-muted">
                        Expires <span className="text-syntax-string">{d.expiry}</span>
                        <span className="text-text-secondary"> · </span>
                        <span className="tabular-nums">{d.days} days left</span>
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={u.variant}>{u.label}</Badge>
                      <Button size="sm" variant="outline">
                        Renew
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-mono text-sm font-semibold uppercase tracking-wider text-accent-yellow">
            Retention nudges
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {RETENTION_NUDGES.map((n) => (
              <Card
                key={n.title}
                className={cn(
                  "border-border-default bg-bg-editor",
                  n.tone === "bad" && "border-accent-red/30",
                  n.tone === "warn" && "border-accent-yellow/25"
                )}
              >
                <CardContent className="space-y-2 py-4">
                  <p className="font-mono text-sm font-semibold text-syntax-param">{n.title}</p>
                  <p className="text-sm text-text-secondary">{n.detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-6 font-mono text-sm font-semibold uppercase tracking-wider text-syntax-decorator">
            Compliance timeline
          </h2>
          <div className="relative pl-6">
            <div
              className="absolute bottom-2 left-[7px] top-2 w-px bg-border-default"
              aria-hidden
            />
            <ul className="space-y-6">
              {TIMELINE.map((item) => (
                <li key={item.date} className="relative">
                  <span
                    className="absolute -left-6 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-syntax-param bg-bg-editor"
                    aria-hidden
                  />
                  <p className="font-mono text-xs font-semibold text-syntax-string">{item.date}</p>
                  <p className="mt-1 font-mono text-sm text-text-primary">{item.title}</p>
                  <p className="mt-1 text-sm text-text-secondary">{item.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-mono text-sm font-semibold uppercase tracking-wider text-syntax-builtin">
            Health breakdown
          </h2>
          <div className="grid gap-5 md:grid-cols-2">
            {DOMAINS.map((domain) => (
              <Card
                key={domain.title}
                className="border-border-default bg-bg-card hover:bg-bg-card-hover"
              >
                <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
                  <CardTitle className="border-0 pb-0 text-base">{domain.title}</CardTitle>
                  <span
                    className={cn("font-mono text-lg font-bold tabular-nums", scoreTextClass(domain.score))}
                  >
                    {domain.score}%
                  </span>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ProgressBar value={domain.score} color={scoreBarColor(domain.score)} />
                  <div className="divide-y divide-border-default/80 rounded-lg border border-border-default bg-bg-input/40 px-3">
                    {domain.checks.map((c) => (
                      <CheckRow key={c.name} name={c.name} state={c.state} />
                    ))}
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
