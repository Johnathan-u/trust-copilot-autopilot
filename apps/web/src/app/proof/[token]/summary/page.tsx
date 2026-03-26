"use client";

import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";

const COMPANY_NAME = "Nimbus Security";
const TOTAL_SCORE = 72;

const categoryScores = [
  {
    name: "Trust Infrastructure",
    score: 80,
    detail:
      "SSO, MFA, and prod access reviews are in place. Segmentation diagrams should be refreshed for the latest regions.",
  },
  {
    name: "Policy Documentation",
    score: 68,
    detail:
      "Acceptable use and data handling policies are published. Encryption standards need explicit key-management references.",
  },
  {
    name: "Vendor Management",
    score: 72,
    detail:
      "Tier-1 vendors have annual reviews. Tier-2 onboarding checklists are inconsistent across business units.",
  },
  {
    name: "Incident Response",
    score: 60,
    detail:
      "On-call and severity definitions are clear. Postmortems are internal-only—customer comms templates are missing.",
  },
  {
    name: "Data Privacy",
    score: 82,
    detail:
      "DSAR workflow and subprocessors are documented. Cross-border transfer assessments need legal sign-off.",
  },
];

const phases = [
  {
    phase: "Phase 1 — Days 1–30",
    title: "Stabilize evidence",
    items: [
      "Wire SOC 2 controls to ticketing and IAM exports",
      "Publish Trust Center updates and subprocessors",
    ],
  },
  {
    phase: "Phase 2 — Days 31–60",
    title: "Close structural gaps",
    items: [
      "ISO SoA draft + policy crosswalk",
      "Vendor tier-2 review backlog to under ten open items",
    ],
  },
  {
    phase: "Phase 3 — Days 61–90",
    title: "Prove maturity",
    items: [
      "Tabletop exercise with documented outcomes",
      "Customer-facing incident comms playbook v1",
    ],
  },
];

export default function ProofSummaryPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;

  return (
    <div className="min-h-screen bg-bg-root px-4 py-12 font-sans sm:px-6 md:py-16">
      <div className="mx-auto max-w-3xl">
        <header className="mb-10 text-center">
          <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-syntax-keyword">
            Trust Copilot
          </p>
          <h1 className="mt-3 font-mono text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
            Executive Summary
          </h1>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <Badge variant="tech" className="normal-case tracking-normal">
              {COMPANY_NAME}
            </Badge>
            <span className="font-mono text-xs text-text-muted">{token}</span>
          </div>
        </header>

        <Card className="mb-8 border-border-default bg-bg-editor">
          <CardContent className="pt-6">
            <p className="text-[15px] leading-relaxed text-text-secondary">
              {COMPANY_NAME} demonstrates a credible trust posture for growth-stage buyers: public
              artifacts are fresh, and core security practices are recognizable in diligence. The
              largest lift is turning informal processes into auditor-grade evidence—especially
              around change management, vendor attestations, and exercised incident playbooks.
              Closing those gaps in the next quarter materially reduces questionnaire cycle time
              and competitive discount pressure.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8 border-2 border-border-active bg-bg-card">
          <CardHeader className="border-border-default">
            <CardTitle className="text-lg text-syntax-class">Total Trust Readiness</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-6xl font-semibold text-syntax-param">
                  {TOTAL_SCORE}
                </span>
                <span className="font-mono text-xl text-text-muted">/100</span>
              </div>
              <Badge variant="success">Good</Badge>
            </div>
            <ProgressBar
              className="mt-4"
              value={TOTAL_SCORE}
              color="var(--color-accent-green)"
              showLabel
            />
          </CardContent>
        </Card>

        <section className="space-y-4">
          <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-syntax-builtin">
            Detailed scoring breakdown
          </h2>
          {categoryScores.map((cat) => (
            <Card
              key={cat.name}
              className="border-border-default bg-bg-editor hover:border-border-active"
            >
              <CardHeader className="py-3">
                <div className="flex w-full flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-syntax-param">{cat.name}</CardTitle>
                  <span className="font-mono text-sm font-semibold text-text-primary">
                    {cat.score}
                    <span className="text-text-muted">/100</span>
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <ProgressBar
                  value={cat.score}
                  color="var(--color-syntax-class)"
                />
                <p className="text-sm leading-relaxed text-text-secondary">{cat.detail}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="mt-10">
          <h2 className="mb-4 font-mono text-sm font-semibold uppercase tracking-wider text-syntax-string">
            Recommended 90-day plan
          </h2>
          <div className="space-y-4">
            {phases.map((p) => (
              <Card key={p.phase} className="border-border-default bg-bg-editor">
                <CardHeader>
                  <CardTitle className="text-syntax-keyword">{p.phase}</CardTitle>
                  <p className="font-mono text-xs text-text-secondary">{p.title}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2 text-sm text-text-secondary">
                    {p.items.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="font-mono text-accent-green">▸</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <footer className="mt-12 border-t border-border-default pt-10 text-center">
          <Button size="lg" className="h-11 min-w-[260px]">
            Get Started with Trust Copilot
          </Button>
          <p className="mt-6 text-xs text-text-muted">
            This summary is confidential and prepared solely for {COMPANY_NAME}.
          </p>
        </footer>
      </div>
    </div>
  );
}
