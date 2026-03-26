"use client";

import { FolderOpen } from "lucide-react";
import Link from "next/link";

const PLACEHOLDER_DOCS = [
  {
    name: "Policies — Information Security.pdf",
    freshness: "Fresh",
    reuse: "Reusable across vendors",
  },
  {
    name: "SOC 2 Type II report (redacted).pdf",
    freshness: "Expires in 45 days",
    reuse: "Linked to 2 questionnaires",
  },
  {
    name: "Pen test summary — Q3.pdf",
    freshness: "Stale — over 12 months",
    reuse: "Not yet reused",
  },
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
          className={`rounded-lg px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors hover:bg-bg-card hover:text-text-primary ${
            l.href === "/workspace/docs"
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

export default function EvidenceVaultPage() {
  return (
    <div className="min-h-screen bg-bg-root">
      <div className="mx-auto max-w-4xl px-6 py-12 md:py-16">
        <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-syntax-builtin/25 bg-syntax-builtin/10 text-syntax-builtin">
              <FolderOpen className="h-6 w-6" strokeWidth={1.5} aria-hidden />
            </div>
            <div>
              <h1 className="font-mono text-2xl font-semibold text-text-primary">
                Evidence vault
              </h1>
              <p className="mt-1 text-sm text-text-secondary">
                Uploaded documents, freshness, and where they&apos;re reused.
              </p>
            </div>
          </div>
        </header>

        <WorkspaceNav />

        <ul className="mt-10 space-y-4">
          {PLACEHOLDER_DOCS.map((doc) => (
            <li
              key={doc.name}
              className="rounded-2xl border border-border-default bg-bg-editor/50 p-5 md:p-6"
            >
              <p className="font-medium text-text-primary">{doc.name}</p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md border border-accent-green/30 bg-accent-green/10 px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-wide text-accent-green">
                    {doc.freshness}
                  </span>
                </div>
                <p className="text-sm text-text-secondary">{doc.reuse}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
