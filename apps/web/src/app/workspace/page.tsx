"use client";

import { LayoutDashboard, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const PLACEHOLDER_QUESTIONNAIRES = [
  { name: "Acme — SOC 2 readiness", status: "In review", updated: "—" },
  { name: "Vendor security assessment Q4", status: "Draft", updated: "—" },
  { name: "Enterprise RFP — Annex C", status: "Complete", updated: "—" },
];

function WorkspaceNav() {
  const links = [
    { href: "/workspace", label: "Home" },
    { href: "/workspace/docs", label: "Evidence vault" },
    { href: "/workspace/health", label: "Health" },
  ];
  return (
    <nav className="flex flex-wrap gap-2 border-b border-border-default pb-4">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className="rounded-lg px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-text-secondary transition-colors hover:bg-bg-card hover:text-text-primary"
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}

export default function CustomerWorkspaceHomePage() {
  return (
    <div className="min-h-screen bg-bg-root">
      <div className="mx-auto max-w-4xl px-6 py-12 md:py-16">
        <header className="mb-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-syntax-class/25 bg-syntax-class/10 text-syntax-class">
              <LayoutDashboard className="h-6 w-6" strokeWidth={1.5} aria-hidden />
            </div>
            <div>
              <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-text-muted">
                Workspace
              </p>
              <h1 className="mt-1 font-mono text-2xl font-semibold tracking-tight text-text-primary md:text-3xl">
                Acme Corp
              </h1>
              <p className="mt-2 max-w-xl text-sm text-text-secondary">
                Your home for questionnaires, uploads, and proof—without the
                operator console.
              </p>
            </div>
          </div>
          <Button size="lg" className="h-11 shrink-0 self-start">
            <Plus className="h-4 w-4" aria-hidden />
            Upload
          </Button>
        </header>

        <WorkspaceNav />

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_280px]">
          <section className="rounded-2xl border border-border-default bg-bg-editor/50 p-6 md:p-8">
            <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-syntax-builtin">
              Recent questionnaires
            </h2>
            <ul className="mt-6 space-y-4">
              {PLACEHOLDER_QUESTIONNAIRES.map((q) => (
                <li
                  key={q.name}
                  className="flex flex-col gap-2 rounded-xl border border-border-default bg-bg-card/40 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-text-primary">{q.name}</p>
                    <p className="mt-0.5 text-xs text-text-muted">
                      Updated {q.updated}
                    </p>
                  </div>
                  <span className="inline-flex w-fit rounded-md border border-border-active bg-bg-input px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-wide text-syntax-class">
                    {q.status}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-border-default bg-bg-card/50 p-6">
              <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-text-muted">
                Status summary
              </h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-text-secondary">Active reviews</dt>
                  <dd className="font-mono text-text-primary">—</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-text-secondary">Proof packs</dt>
                  <dd className="font-mono text-text-primary">—</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-text-secondary">Open tasks</dt>
                  <dd className="font-mono text-accent-blue-bright">—</dd>
                </div>
              </dl>
            </div>
            <div className="rounded-2xl border border-border-default border-dashed bg-bg-input/30 p-6 text-center">
              <p className="text-sm text-text-secondary">
                Drag files here or use Upload to add evidence to your vault.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
