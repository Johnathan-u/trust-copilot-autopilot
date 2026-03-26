"use client";

import type { ComponentProps } from "react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { FolderOpen } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DocType = "Policy" | "Audit" | "Certificate" | "Report";
type DocStatus = "Current" | "Expiring Soon" | "Expired";

const DOC_TYPES: (DocType | "All")[] = [
  "All",
  "Policy",
  "Audit",
  "Certificate",
  "Report",
];
const STATUSES: (DocStatus | "All")[] = [
  "All",
  "Current",
  "Expiring Soon",
  "Expired",
];

const DOCUMENTS: {
  name: string;
  icon: string;
  type: DocType;
  status: DocStatus;
  uploadedBy: string;
  uploadDate: string;
  expiry: string;
  size: string;
}[] = [
  {
    name: "SOC 2 Type II Report",
    icon: "📄",
    type: "Report",
    status: "Current",
    uploadedBy: "Jordan Lee",
    uploadDate: "Mar 10, 2025",
    expiry: "Mar 10, 2026",
    size: "2.4 MB",
  },
  {
    name: "Information Security Policy",
    icon: "📃",
    type: "Policy",
    status: "Current",
    uploadedBy: "Alex Rivera",
    uploadDate: "Feb 2, 2025",
    expiry: "—",
    size: "180 KB",
  },
  {
    name: "ISO 27001 Certificate",
    icon: "📄",
    type: "Certificate",
    status: "Expiring Soon",
    uploadedBy: "Priya Shah",
    uploadDate: "Apr 18, 2024",
    expiry: "Apr 18, 2025",
    size: "520 KB",
  },
  {
    name: "Penetration Test Report",
    icon: "📄",
    type: "Report",
    status: "Current",
    uploadedBy: "Sam Okonkwo",
    uploadDate: "Jan 8, 2025",
    expiry: "Jan 8, 2026",
    size: "3.1 MB",
  },
  {
    name: "Business Continuity Plan",
    icon: "📃",
    type: "Policy",
    status: "Current",
    uploadedBy: "Alex Rivera",
    uploadDate: "Nov 30, 2024",
    expiry: "—",
    size: "640 KB",
  },
  {
    name: "Privacy Policy",
    icon: "📄",
    type: "Policy",
    status: "Current",
    uploadedBy: "Jordan Lee",
    uploadDate: "Dec 12, 2024",
    expiry: "—",
    size: "95 KB",
  },
  {
    name: "Vendor Assessment Template",
    icon: "📊",
    type: "Audit",
    status: "Expired",
    uploadedBy: "Alex Rivera",
    uploadDate: "Aug 3, 2023",
    expiry: "Aug 3, 2024",
    size: "72 KB",
  },
  {
    name: "Incident Response Playbook",
    icon: "📃",
    type: "Policy",
    status: "Expiring Soon",
    uploadedBy: "Priya Shah",
    uploadDate: "Jun 1, 2024",
    expiry: "Jun 1, 2025",
    size: "410 KB",
  },
];

function statusBadgeVariant(
  status: DocStatus
): ComponentProps<typeof Badge>["variant"] {
  if (status === "Current") return "success";
  if (status === "Expiring Soon") return "p1";
  return "p0";
}

function typeBadgeVariant(
  type: DocType
): ComponentProps<typeof Badge>["variant"] {
  switch (type) {
    case "Policy":
      return "qualification";
    case "Audit":
      return "discovery";
    case "Certificate":
      return "tech";
    case "Report":
      return "route";
    default:
      return "default";
  }
}

export default function TrustRoomDocumentsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<(typeof DOC_TYPES)[number]>(
    "All"
  );
  const [statusFilter, setStatusFilter] = useState<
    (typeof STATUSES)[number]
  >("All");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return DOCUMENTS.filter((d) => {
      if (typeFilter !== "All" && d.type !== typeFilter) return false;
      if (statusFilter !== "All" && d.status !== statusFilter) return false;
      if (q && !d.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, typeFilter, statusFilter]);

  const totalBytesApprox =
    2.4 + 0.18 + 0.52 + 3.1 + 0.64 + 0.095 + 0.072 + 0.41;

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
                Workspace documents
              </h1>
              <p className="mt-2 text-sm text-text-secondary">
                Nimbus Security Trust Room — policies, certificates, and audit
                evidence in one place.
              </p>
            </div>
          </div>
          <Button size="lg" className="shrink-0 self-start">
            Upload
          </Button>
        </header>

        <nav
          className="mb-8 flex flex-wrap justify-center gap-1 border-b border-border-default sm:justify-start"
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

        <Card className="mb-6 border-border-default bg-bg-editor">
          <CardContent className="space-y-4 py-5">
            <label className="block">
              <span className="sr-only">Search documents</span>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name…"
                className="w-full rounded-lg border border-border-default bg-bg-input px-4 py-2.5 font-sans text-sm text-text-primary placeholder:text-text-muted focus:border-syntax-param focus:outline-none focus:ring-1 focus:ring-syntax-param/40"
              />
            </label>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[0.65rem] uppercase tracking-wider text-text-muted">
                  Type
                </span>
                {DOC_TYPES.map((t) => (
                  <Button
                    key={t}
                    type="button"
                    size="sm"
                    variant={typeFilter === t ? "default" : "outline"}
                    className={cn(
                      typeFilter === t && "shadow-none",
                      typeFilter !== t && "text-text-secondary"
                    )}
                    onClick={() => setTypeFilter(t)}
                  >
                    {t}
                  </Button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[0.65rem] uppercase tracking-wider text-text-muted">
                  Status
                </span>
                {STATUSES.map((s) => (
                  <Button
                    key={s}
                    type="button"
                    size="sm"
                    variant={statusFilter === s ? "default" : "outline"}
                    className={cn(
                      statusFilter === s && "shadow-none",
                      statusFilter !== s && "text-text-secondary"
                    )}
                    onClick={() => setStatusFilter(s)}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-border-default bg-bg-editor">
          <CardHeader className="bg-bg-card/50">
            <CardTitle>All documents</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border-default bg-bg-input/60 font-mono text-[0.65rem] uppercase tracking-wider text-text-muted">
                  <th className="px-5 py-3 font-semibold">Name</th>
                  <th className="px-5 py-3 font-semibold">Type</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Uploaded by</th>
                  <th className="px-5 py-3 font-semibold">Upload date</th>
                  <th className="px-5 py-3 font-semibold">Expiry</th>
                  <th className="px-5 py-3 font-semibold">Size</th>
                  <th className="px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
                  <tr
                    key={d.name}
                    className="border-b border-border-default bg-bg-editor transition-colors hover:bg-bg-card-hover/80"
                  >
                    <td className="px-5 py-3.5">
                      <span className="mr-2 text-base" aria-hidden>
                        {d.icon}
                      </span>
                      <span className="font-medium text-text-primary">
                        {d.name}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={typeBadgeVariant(d.type)}>{d.type}</Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={statusBadgeVariant(d.status)}>
                        {d.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-text-secondary">
                      {d.uploadedBy}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-text-muted">
                      {d.uploadDate}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-text-muted">
                      {d.expiry}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-text-secondary">
                      {d.size}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-2">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          Download
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <footer className="mt-6 flex flex-col gap-2 border-t border-border-default pt-6 font-mono text-xs text-text-secondary sm:flex-row sm:items-center sm:justify-between">
          <span>
            <span className="text-syntax-param">{filtered.length}</span> of{" "}
            <span className="text-text-primary">{DOCUMENTS.length}</span>{" "}
            documents shown
          </span>
          <span>
            Total storage (approx):{" "}
            <span className="text-syntax-string">
              ~{totalBytesApprox.toFixed(2)} MB
            </span>
          </span>
        </footer>
      </div>
    </div>
  );
}
