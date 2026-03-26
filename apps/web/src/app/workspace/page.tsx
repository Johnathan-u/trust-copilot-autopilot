"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { FileUp, Shield } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";

const WORKSPACE = {
  name: "Nimbus Security Trust Room",
  created: "Jan 12, 2025",
  lastActivity: "2 hours ago",
  owner: "Alex Rivera",
  accessLevel: "Contributor" as const,
};

const QUICK_STATS = [
  { label: "Documents", value: "12", hint: "text-syntax-class" },
  { label: "Compliance score", value: "84%", hint: "text-accent-green", bar: 84 },
  { label: "Issues", value: "3", hint: "text-accent-yellow" },
  { label: "Team members", value: "5", hint: "text-syntax-param" },
];

const RECENT_ACTIVITY = [
  {
    ts: "Today · 10:42",
    user: "Jordan Lee",
    action: "Uploaded SOC 2 executive summary (PDF)",
  },
  {
    ts: "Yesterday · 16:08",
    user: "Alex Rivera",
    action: "Updated Information Security Policy v3.2",
  },
  {
    ts: "Mar 22 · 09:15",
    user: "Sam Okonkwo",
    action: "Resolved issue: Missing vendor DPA evidence",
  },
  {
    ts: "Mar 20 · 14:33",
    user: "Priya Shah",
    action: "Added ISO 27001 certificate to vault",
  },
  {
    ts: "Mar 18 · 11:02",
    user: "Alex Rivera",
    action: "Commented on penetration test remediation plan",
  },
];

export default function TrustRoomWorkspacePage() {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onBrowseClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="min-h-screen bg-bg-root font-sans text-text-primary">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-6 py-12 md:py-16">
        <header className="mb-8 text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl border border-syntax-class/30 bg-syntax-class/10 text-syntax-class">
            <Shield className="h-7 w-7" strokeWidth={1.5} aria-hidden />
          </div>
          <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-text-muted">
            Trust Copilot
          </p>
          <h1 className="mt-2 font-mono text-2xl font-semibold tracking-tight text-text-primary md:text-3xl">
            {WORKSPACE.name}
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm text-text-secondary">
            Customer trust workspace — share evidence, track posture, and stay
            audit-ready without the operator console.
          </p>
        </header>

        <nav
          className="mb-8 flex justify-center gap-1 border-b border-border-default"
          aria-label="Workspace sections"
        >
          <span
            className={cn(
              "inline-flex border-b-2 border-syntax-param px-4 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-syntax-param"
            )}
          >
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
              <CardTitle>Workspace status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-sm font-semibold text-text-primary">
                    {WORKSPACE.name}
                  </p>
                  <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-text-muted">Created</dt>
                      <dd className="font-mono text-text-secondary">
                        {WORKSPACE.created}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-text-muted">Last activity</dt>
                      <dd className="font-mono text-text-secondary">
                        {WORKSPACE.lastActivity}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-text-muted">Owner</dt>
                      <dd className="text-text-secondary">{WORKSPACE.owner}</dd>
                    </div>
                    <div>
                      <dt className="text-text-muted">Access</dt>
                      <dd className="mt-1">
                        <Badge variant="info">{WORKSPACE.accessLevel}</Badge>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {QUICK_STATS.map((s) => (
              <Card
                key={s.label}
                className="border-border-default bg-bg-card hover:bg-bg-card-hover"
              >
                <CardContent className="space-y-3 py-4">
                  <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-wider text-text-muted">
                    {s.label}
                  </p>
                  <p
                    className={cn(
                      "font-mono text-2xl font-semibold tabular-nums",
                      s.hint
                    )}
                  >
                    {s.value}
                  </p>
                  {"bar" in s && s.bar != null ? (
                    <ProgressBar
                      value={s.bar}
                      color="var(--color-accent-green)"
                      className="pt-1"
                    />
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-border-default bg-bg-editor">
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-0 divide-y divide-border-default px-0 py-0">
              {RECENT_ACTIVITY.map((row) => (
                <div
                  key={`${row.ts}-${row.action}`}
                  className="flex flex-col gap-1 px-5 py-4 first:pt-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                >
                  <div>
                    <p className="text-sm text-text-primary">{row.action}</p>
                    <p className="mt-1 font-mono text-xs text-syntax-keyword">
                      {row.user}
                    </p>
                  </div>
                  <p className="shrink-0 font-mono text-xs text-text-muted">
                    {row.ts}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              className="sr-only"
              accept=".pdf,.doc,.docx,.xlsx"
              multiple
              aria-hidden
            />
            <div
              role="button"
              tabIndex={0}
              onClick={onBrowseClick}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onBrowseClick();
                }
              }}
              onDragEnter={() => setIsDragActive(true)}
              onDragLeave={() => setIsDragActive(false)}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragActive(true);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragActive(false);
              }}
              className={cn(
                "flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border-default bg-bg-input px-6 py-12 text-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-syntax-param/50",
                isDragActive
                  ? "border-syntax-param/60 bg-bg-card-hover"
                  : "hover:border-border-active hover:bg-bg-card/40"
              )}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border-default bg-bg-card text-syntax-builtin">
                <FileUp className="h-6 w-6" strokeWidth={1.5} aria-hidden />
              </div>
              <p className="font-mono text-sm font-medium text-syntax-string">
                Drag &amp; drop files or click to browse
              </p>
              <p className="max-w-md text-xs text-text-secondary">
                Accepted formats:{" "}
                <span className="font-mono text-syntax-param">
                  .pdf, .doc, .xlsx
                </span>
              </p>
            </div>
            <div className="mt-4 flex justify-center">
              <Button asChild variant="outline" size="sm">
                <Link href="/workspace/docs">Open document library</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
