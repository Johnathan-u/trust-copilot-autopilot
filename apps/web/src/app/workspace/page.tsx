"use client";

import Link from "next/link";
import { Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";

const WORKSPACE = {
  company: "Nimbus Security",
  plan: "Professional Trust Platform",
  created: "Jan 12, 2025",
  healthScore: 84,
} as const;

const QUESTIONNAIRES = [
  {
    id: "q1",
    title: "Security Assessment Q3",
    requester: "Acme Procurement",
    due: "Apr 2, 2025",
    progress: 62,
    status: "In progress" as const,
  },
  {
    id: "q2",
    title: "Vendor Due Diligence",
    requester: "Northwind Legal",
    due: "Apr 18, 2025",
    progress: 28,
    status: "Pending" as const,
  },
  {
    id: "q3",
    title: "SOC 2 Readiness",
    requester: "Internal Audit",
    due: "May 5, 2025",
    progress: 91,
    status: "Review" as const,
  },
] as const;

const QUICK_ACTIONS = [
  { title: "Upload Document", body: "Add evidence to your vault.", hint: "text-syntax-string" },
  { title: "Start Assessment", body: "Launch a new security questionnaire.", hint: "text-syntax-class" },
  { title: "View Reports", body: "SOC 2, ISO, and executive summaries.", hint: "text-syntax-param" },
  { title: "Invite Reviewer", body: "Share read-only access with a buyer.", hint: "text-syntax-keyword" },
] as const;

const RECENT_ACTIVITY = [
  { ts: "Today · 10:42", user: "Jordan Lee", action: "Uploaded SOC 2 executive summary (PDF)" },
  { ts: "Yesterday · 16:08", user: "Alex Rivera", action: "Submitted Security Assessment Q3 — section 4" },
  { ts: "Mar 23 · 11:20", user: "Sam Okonkwo", action: "Marked Vendor Due Diligence item as complete" },
  { ts: "Mar 22 · 09:15", user: "Priya Shah", action: "Renewed ISO 27001 certificate metadata" },
  { ts: "Mar 20 · 14:33", user: "Alex Rivera", action: "Invited reviewer legal@contoso.com" },
] as const;

function statusVariant(s: (typeof QUESTIONNAIRES)[number]["status"]) {
  if (s === "In progress") return "info" as const;
  if (s === "Review") return "qualification" as const;
  return "default" as const;
}

export default function WorkspacePage() {
  return (
    <div className="min-h-screen bg-bg-root font-sans text-text-primary">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-12 md:py-16">
        <header className="mb-8 text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl border border-syntax-class/30 bg-syntax-class/10 text-syntax-class">
            <Shield className="h-7 w-7" strokeWidth={1.5} aria-hidden />
          </div>
          <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-text-muted">
            Trust Copilot
          </p>
          <h1 className="mt-2 font-mono text-2xl font-semibold tracking-tight text-text-primary md:text-3xl">
            Workspace
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm text-text-secondary">
            Questionnaire queue, evidence, and health—your customer-facing trust workspace.
          </p>
        </header>

        <nav
          className="mb-8 flex justify-center gap-1 border-b border-border-default"
          aria-label="Workspace sections"
        >
          <span className="inline-flex border-b-2 border-syntax-param px-4 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-syntax-param">
            Overview
          </span>
          <Link
            href="/workspace/docs"
            className="inline-flex border-b-2 border-transparent px-4 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-text-secondary transition-colors hover:text-text-primary"
          >
            Documents
          </Link>
          <Link
            href="/workspace/health"
            className="inline-flex border-b-2 border-transparent px-4 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-text-secondary transition-colors hover:text-text-primary"
          >
            Health
          </Link>
        </nav>

        <div className="flex flex-1 flex-col gap-8">
          <Card className="border-border-default bg-bg-editor">
            <CardHeader>
              <CardTitle className="font-mono text-sm uppercase tracking-wider text-syntax-builtin">
                Workspace status
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div>
                <p className="font-mono text-lg font-semibold text-text-primary">{WORKSPACE.company}</p>
                <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-text-muted">Created</dt>
                    <dd className="font-mono text-text-secondary">{WORKSPACE.created}</dd>
                  </div>
                  <div>
                    <dt className="text-text-muted">Health score</dt>
                    <dd className="font-mono text-accent-green tabular-nums">{WORKSPACE.healthScore}/100</dd>
                  </div>
                </dl>
              </div>
              <Badge variant="tech" className="h-fit w-fit font-mono text-[0.65rem] uppercase tracking-wider">
                {WORKSPACE.plan}
              </Badge>
            </CardContent>
          </Card>

          <section>
            <h2 className="mb-4 font-mono text-sm font-semibold uppercase tracking-wider text-syntax-keyword">
              Questionnaire queue
            </h2>
            <div className="grid gap-4 lg:grid-cols-3">
              {QUESTIONNAIRES.map((q) => (
                <Card
                  key={q.id}
                  className="border-border-default bg-bg-card transition-colors hover:bg-bg-card-hover"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base text-text-primary">{q.title}</CardTitle>
                      <Badge variant={statusVariant(q.status)}>{q.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <p className="text-xs text-text-secondary">
                      <span className="text-text-muted">Requester · </span>
                      {q.requester}
                    </p>
                    <p className="font-mono text-xs text-syntax-string">Due {q.due}</p>
                    <div>
                      <div className="mb-1 flex justify-between font-mono text-[0.65rem] text-text-muted">
                        <span>Progress</span>
                        <span className="tabular-nums">{q.progress}%</span>
                      </div>
                      <ProgressBar value={q.progress} color="var(--color-syntax-class)" />
                    </div>
                    <Button size="sm" className="w-full">
                      Continue
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-4 font-mono text-sm font-semibold uppercase tracking-wider text-syntax-decorator">
              Quick actions
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {QUICK_ACTIONS.map((a) => (
                <Card
                  key={a.title}
                  className="cursor-pointer border-border-default bg-bg-card transition-colors hover:bg-bg-card-hover"
                >
                  <CardContent className="space-y-2 py-4">
                    <p className={cn("font-mono text-sm font-semibold", a.hint)}>{a.title}</p>
                    <p className="text-xs text-text-secondary">{a.body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <Card className="border-border-default bg-bg-editor">
            <CardHeader>
              <CardTitle className="text-syntax-function">Recent activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-0 divide-y divide-border-default px-0 py-0">
              {RECENT_ACTIVITY.map((row) => (
                <div
                  key={`${row.ts}-${row.action}`}
                  className="flex flex-col gap-1 px-5 py-4 first:pt-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                >
                  <div>
                    <p className="text-sm text-text-primary">{row.action}</p>
                    <p className="mt-1 font-mono text-xs text-syntax-keyword">{row.user}</p>
                  </div>
                  <p className="shrink-0 font-mono text-xs text-text-muted">{row.ts}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
