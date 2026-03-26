"use client";

import type { ComponentProps } from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { FolderOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DocCategory = "Policies" | "Audits" | "Certificates" | "Reports" | "Evidence";
type VerifyStatus = "verified" | "unverified" | "expired";

const CATEGORIES: (DocCategory | "All")[] = [
  "All",
  "Policies",
  "Audits",
  "Certificates",
  "Reports",
  "Evidence",
];

const DOCUMENTS: {
  name: string;
  emoji: string;
  category: DocCategory;
  verify: VerifyStatus;
  owner: string;
  lastUpdated: string;
  expiry: string;
  controlsMapped: number;
}[] = [
  {
    name: "SOC 2 Type II Report — FY25",
    emoji: "📄",
    category: "Reports",
    verify: "verified",
    owner: "Jordan Lee",
    lastUpdated: "Mar 10, 2025",
    expiry: "Mar 10, 2026",
    controlsMapped: 42,
  },
  {
    name: "Information Security Policy v3.2",
    emoji: "📃",
    category: "Policies",
    verify: "verified",
    owner: "Alex Rivera",
    lastUpdated: "Feb 2, 2025",
    expiry: "—",
    controlsMapped: 18,
  },
  {
    name: "ISO 27001 Certificate",
    emoji: "🪪",
    category: "Certificates",
    verify: "unverified",
    owner: "Priya Shah",
    lastUpdated: "Apr 18, 2024",
    expiry: "Apr 18, 2025",
    controlsMapped: 12,
  },
  {
    name: "Penetration Test Executive Summary",
    emoji: "🔐",
    category: "Audits",
    verify: "verified",
    owner: "Sam Okonkwo",
    lastUpdated: "Jan 8, 2025",
    expiry: "Jan 8, 2026",
    controlsMapped: 9,
  },
  {
    name: "Vendor Risk Assessment — CloudNine",
    emoji: "📊",
    category: "Evidence",
    verify: "verified",
    owner: "Alex Rivera",
    lastUpdated: "Mar 1, 2025",
    expiry: "Mar 1, 2026",
    controlsMapped: 7,
  },
  {
    name: "Business Continuity Plan",
    emoji: "📋",
    category: "Policies",
    verify: "verified",
    owner: "Alex Rivera",
    lastUpdated: "Nov 30, 2024",
    expiry: "—",
    controlsMapped: 11,
  },
  {
    name: "Privacy Policy — External",
    emoji: "🛡️",
    category: "Policies",
    verify: "unverified",
    owner: "Jordan Lee",
    lastUpdated: "Dec 12, 2024",
    expiry: "—",
    controlsMapped: 6,
  },
  {
    name: "Access Control Evidence Export",
    emoji: "🗂️",
    category: "Evidence",
    verify: "verified",
    owner: "Sam Okonkwo",
    lastUpdated: "Mar 18, 2025",
    expiry: "Sep 18, 2025",
    controlsMapped: 24,
  },
  {
    name: "Expired Vendor DPA — Legacy",
    emoji: "⚠️",
    category: "Audits",
    verify: "expired",
    owner: "Alex Rivera",
    lastUpdated: "Aug 3, 2023",
    expiry: "Aug 3, 2024",
    controlsMapped: 0,
  },
  {
    name: "Incident Response Playbook",
    emoji: "📖",
    category: "Policies",
    verify: "unverified",
    owner: "Priya Shah",
    lastUpdated: "Jun 1, 2024",
    expiry: "Jun 1, 2025",
    controlsMapped: 14,
  },
];

function verifyBadge(v: VerifyStatus) {
  if (v === "verified")
    return { label: "Verified", className: "border-accent-green/40 bg-accent-green/10 text-accent-green" };
  if (v === "unverified")
    return {
      label: "Unverified",
      className: "border-accent-yellow/40 bg-accent-yellow/10 text-accent-yellow",
    };
  return { label: "Expired", className: "border-accent-red/40 bg-accent-red/10 text-accent-red" };
}

function categoryVariant(c: DocCategory): ComponentProps<typeof Badge>["variant"] {
  switch (c) {
    case "Policies":
      return "qualification";
    case "Audits":
      return "discovery";
    case "Certificates":
      return "tech";
    case "Reports":
      return "route";
    default:
      return "info";
  }
}

export default function WorkspaceDocsPage() {
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const fileRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const filtered = useMemo(() => {
    return DOCUMENTS.filter((d) => (category === "All" ? true : d.category === category));
  }, [category]);

  const stats = useMemo(() => {
    const total = DOCUMENTS.length;
    const verified = DOCUMENTS.filter((d) => d.verify === "verified").length;
    const expiringSoon = DOCUMENTS.filter((d) => {
      if (d.expiry === "—") return false;
      const t = Date.parse(d.expiry);
      if (Number.isNaN(t)) return false;
      const days = (t - Date.now()) / (24 * 60 * 60 * 1000);
      return days > 0 && days <= 90;
    }).length;
    return { total, verified, expiringSoon, storage: "2.4 GB" };
  }, []);

  const onBrowse = useCallback(() => fileRef.current?.click(), []);

  return (
    <div className="min-h-screen bg-bg-root font-sans text-text-primary">
      <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        <header className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-syntax-builtin/30 bg-syntax-builtin/10 text-syntax-builtin">
              <FolderOpen className="h-6 w-6" strokeWidth={1.5} aria-hidden />
            </div>
            <div>
              <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-text-muted">
                Trust Copilot
              </p>
              <h1 className="mt-1 font-mono text-2xl font-semibold tracking-tight text-text-primary md:text-3xl">
                Evidence vault
              </h1>
              <p className="mt-2 text-sm text-text-secondary">
                Nimbus Security — policies, certificates, audit artifacts, and mapped controls.
              </p>
            </div>
          </div>
        </header>

        <nav
          className="mb-6 flex flex-wrap justify-center gap-1 border-b border-border-default sm:justify-start"
          aria-label="Workspace sections"
        >
          <Link
            href="/workspace"
            className="inline-flex border-b-2 border-transparent px-4 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-text-secondary transition-colors hover:text-text-primary"
          >
            Overview
          </Link>
          <span className="inline-flex border-b-2 border-syntax-param px-4 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-syntax-param">
            Documents
          </span>
          <Link
            href="/workspace/health"
            className="inline-flex border-b-2 border-transparent px-4 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-text-secondary transition-colors hover:text-text-primary"
          >
            Health
          </Link>
        </nav>

        <div className="mb-6">
          <input ref={fileRef} type="file" className="sr-only" multiple accept=".pdf,.doc,.docx,.xlsx" />
          <div
            role="button"
            tabIndex={0}
            onClick={onBrowse}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onBrowse();
              }
            }}
            onDragEnter={() => setDrag(true)}
            onDragLeave={() => setDrag(false)}
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
            }}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 py-8 text-center transition-colors",
              drag ? "border-border-active bg-bg-card-hover" : "border-border-default bg-bg-input hover:border-border-active"
            )}
          >
            <p className="font-mono text-sm text-syntax-string">Upload documents</p>
            <p className="text-xs text-text-muted">Drag &amp; drop or click — PDF, DOC, DOCX, XLSX</p>
            <Button type="button" size="sm" variant="outline" className="mt-1">
              Browse files
            </Button>
          </div>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total documents", value: String(stats.total), hint: "text-syntax-class" },
            { label: "Verified", value: String(stats.verified), hint: "text-accent-green" },
            { label: "Expiring soon", value: String(stats.expiringSoon), hint: "text-accent-yellow" },
            { label: "Storage used", value: stats.storage, hint: "text-syntax-param" },
          ].map((k) => (
            <Card key={k.label} className="border-border-default bg-bg-card hover:bg-bg-card-hover">
              <CardContent className="space-y-1 py-4">
                <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-wider text-text-muted">
                  {k.label}
                </p>
                <p className={cn("font-mono text-2xl font-semibold tabular-nums", k.hint)}>{k.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mb-4 flex flex-wrap gap-2 border-b border-border-default pb-4">
          {CATEGORIES.map((c) => (
            <Button
              key={c}
              type="button"
              size="sm"
              variant={category === c ? "default" : "outline"}
              className={cn(category !== c && "text-text-secondary")}
              onClick={() => setCategory(c)}
            >
              {c}
            </Button>
          ))}
        </div>

        <Card className="overflow-hidden border-border-default bg-bg-editor">
          <CardHeader className="border-border-default bg-bg-card/40">
            <CardTitle className="font-mono text-sm uppercase tracking-wider text-syntax-builtin">
              Documents
            </CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border-default bg-bg-input/60 font-mono text-[0.65rem] uppercase tracking-wider text-text-muted">
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Verification</th>
                  <th className="px-4 py-3 font-semibold">Owner</th>
                  <th className="px-4 py-3 font-semibold">Last updated</th>
                  <th className="px-4 py-3 font-semibold">Expiry</th>
                  <th className="px-4 py-3 font-semibold">Controls</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => {
                  const v = verifyBadge(d.verify);
                  return (
                    <tr
                      key={d.name}
                      className="border-b border-border-default bg-bg-editor transition-colors hover:bg-bg-card-hover/80"
                    >
                      <td className="px-4 py-3">
                        <span className="mr-2" aria-hidden>
                          {d.emoji}
                        </span>
                        <span className="font-medium text-text-primary">{d.name}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={categoryVariant(d.category)}>{d.category}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex rounded-md border px-2 py-0.5 font-mono text-[0.65rem] font-semibold uppercase tracking-wide",
                            v.className
                          )}
                        >
                          {v.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">{d.owner}</td>
                      <td className="px-4 py-3 font-mono text-xs text-text-muted">{d.lastUpdated}</td>
                      <td className="px-4 py-3 font-mono text-xs text-text-muted">{d.expiry}</td>
                      <td className="px-4 py-3 font-mono text-xs tabular-nums text-syntax-string">
                        {d.controlsMapped}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            Map
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <p className="mt-4 font-mono text-xs text-text-muted">
          Showing <span className="text-syntax-param">{filtered.length}</span> of{" "}
          <span className="text-text-secondary">{DOCUMENTS.length}</span> documents
        </p>
      </div>
    </div>
  );
}
