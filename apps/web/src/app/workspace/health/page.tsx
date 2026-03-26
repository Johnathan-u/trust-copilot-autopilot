"use client";

import { Activity } from "lucide-react";
import Link from "next/link";

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
          className={`rounded-lg px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors hover:bg-bg-card hover:text-text-primary ${
            l.href === "/workspace/health"
              ? "bg-bg-card text-text-primary"
              : "text-text-secondary"
          }`}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}

export default function WorkspaceHealthPage() {
  return (
    <div className="min-h-screen bg-bg-root">
      <div className="mx-auto max-w-4xl px-6 py-12 md:py-16">
        <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-accent-blue-bright/25 bg-glow-blue text-accent-blue-bright">
              <Activity className="h-6 w-6" strokeWidth={1.5} aria-hidden />
            </div>
            <div>
              <h1 className="font-mono text-2xl font-semibold text-text-primary">
                Workspace health
              </h1>
              <p className="mt-1 text-sm text-text-secondary">
                Stay ahead of expirations and keep your vault ready for the next
                questionnaire.
              </p>
            </div>
          </div>
        </header>

        <WorkspaceNav />

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-border-default bg-bg-editor/50 p-6 lg:col-span-1">
            <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-syntax-class">
              Health score
            </h2>
            <p className="mt-4 font-mono text-5xl font-semibold text-accent-blue-bright">
              —<span className="text-2xl text-text-muted">/100</span>
            </p>
            <p className="mt-3 text-sm text-text-secondary">
              Placeholder composite of freshness, coverage, and open gaps.
            </p>
          </section>

          <section className="rounded-2xl border border-border-default bg-bg-card/40 p-6 lg:col-span-2">
            <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-accent-yellow">
              Expiring soon
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-text-secondary">
              <li className="flex justify-between gap-4 border-b border-border-default pb-3">
                <span>SOC 2 report</span>
                <span className="shrink-0 font-mono text-text-primary">— days</span>
              </li>
              <li className="flex justify-between gap-4 border-b border-border-default pb-3">
                <span>Penetration test letter</span>
                <span className="shrink-0 font-mono text-text-primary">— days</span>
              </li>
              <li className="flex justify-between gap-4">
                <span>Vendor DPA on file</span>
                <span className="shrink-0 font-mono text-text-muted">No date</span>
              </li>
            </ul>
          </section>
        </div>

        <section className="mt-6 rounded-2xl border border-border-default bg-bg-editor/40 p-6 md:p-8">
          <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-syntax-builtin">
            Suggested uploads
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              "Updated incident response runbook",
              "Latest access control matrix",
              "Subprocessor list (CSV or PDF)",
              "BCDR test summary",
            ].map((item) => (
              <li
                key={item}
                className="rounded-xl border border-border-default bg-bg-input/50 px-4 py-3 text-sm text-text-secondary"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
