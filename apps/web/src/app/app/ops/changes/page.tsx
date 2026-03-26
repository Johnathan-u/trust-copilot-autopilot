"use client";

import { useMemo, useState, type ComponentProps } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ChangeType = "All" | "Policy" | "Prompt" | "Model" | "Config";

const ENTRIES = [
  {
    id: "CHG-1042",
    type: "Policy" as const,
    desc: "Tighten ICP floor for healthcare vertical — require SOC2 or HITUST",
    author: "policy-bot",
    ts: "2025-03-24 09:12 UTC",
    from: "icp.health v3",
    to: "icp.health v4",
    status: "deployed" as const,
  },
  {
    id: "CHG-1041",
    type: "Prompt" as const,
    desc: "Revise outreach opener for enterprise tier — fewer claims, more proof points",
    author: "prompt@tc.io",
    ts: "2025-03-24 04:00 UTC",
    from: "outreach.v12",
    to: "outreach.v13",
    status: "pending" as const,
  },
  {
    id: "CHG-1040",
    type: "Model" as const,
    desc: "Promote ranking model v1.3.0 to 25% shadow traffic",
    author: "ml-release",
    ts: "2025-03-23 18:44 UTC",
    from: "rank v1.2.4",
    to: "rank v1.3.0",
    status: "deployed" as const,
  },
  {
    id: "CHG-1038",
    type: "Config" as const,
    desc: "Increase send concurrency for cert.trustcopilot.com warmup lane",
    author: "sre@tc.io",
    ts: "2025-03-23 15:20 UTC",
    from: "warmup.max=400",
    to: "warmup.max=650",
    status: "deployed" as const,
  },
  {
    id: "CHG-1037",
    type: "Policy" as const,
    desc: "Add competitor domain blocklist for EU outbound",
    author: "trust@tc.io",
    ts: "2025-03-23 11:05 UTC",
    from: "blocklist.eu v1",
    to: "blocklist.eu v2",
    status: "deployed" as const,
  },
  {
    id: "CHG-1035",
    type: "Prompt" as const,
    desc: "Shorten trust-room summary prompt — reduce token budget 18%",
    author: "prompt@tc.io",
    ts: "2025-03-22 22:18 UTC",
    from: "summary.v7",
    to: "summary.v8",
    status: "rolled-back" as const,
  },
  {
    id: "CHG-1034",
    type: "Model" as const,
    desc: "Rollback embedding refresh job — cosine drift detected",
    author: "ml@tc.io",
    ts: "2025-03-22 19:02 UTC",
    from: "emb-2025-03",
    to: "emb-2025-02",
    status: "rolled-back" as const,
  },
  {
    id: "CHG-1032",
    type: "Config" as const,
    desc: "Feature flag: enable multi-domain DKIM rotation",
    author: "infra@tc.io",
    ts: "2025-03-22 10:30 UTC",
    from: "ff.dkim_rotate=off",
    to: "ff.dkim_rotate=on",
    status: "deployed" as const,
  },
  {
    id: "CHG-1030",
    type: "Policy" as const,
    desc: "Deprecate legacy scoring weights for SMB segment",
    author: "policy-bot",
    ts: "2025-03-21 16:40 UTC",
    from: "weights.smb v1",
    to: "weights.smb v2",
    status: "deployed" as const,
  },
  {
    id: "CHG-1028",
    type: "Prompt" as const,
    desc: "Add structured JSON output schema for signal extraction",
    author: "prompt@tc.io",
    ts: "2025-03-21 08:55 UTC",
    from: "extract.v4",
    to: "extract.v5",
    status: "pending" as const,
  },
];

function typeVariant(t: string): ComponentProps<typeof Badge>["variant"] {
  switch (t) {
    case "Policy":
      return "discovery";
    case "Prompt":
      return "qualification";
    case "Model":
      return "tech";
    case "Config":
      return "route";
    default:
      return "default";
  }
}

function statusVariant(s: string): ComponentProps<typeof Badge>["variant"] {
  if (s === "deployed") return "success";
  if (s === "pending") return "warning";
  return "p0";
}

export default function ChangeLogPage() {
  const [filter, setFilter] = useState<ChangeType>("All");
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    return ENTRIES.filter((e) => {
      if (filter !== "All" && e.type !== filter) return false;
      if (!q.trim()) return true;
      const s = q.toLowerCase();
      return e.desc.toLowerCase().includes(s) || e.id.toLowerCase().includes(s) || e.author.toLowerCase().includes(s);
    });
  }, [filter, q]);

  const filters: ChangeType[] = ["All", "Policy", "Prompt", "Model", "Config"];

  return (
    <div className="space-y-6 bg-bg-root min-h-full">
      <div>
        <h1 className="font-mono text-lg font-bold text-text-primary">
          <span className="text-syntax-builtin">def</span> change_log
          <span className="text-text-muted">(</span>
          <span className="text-syntax-class">Audit</span>
          <span className="text-text-muted">):</span>
        </h1>
        <p className="text-xs text-text-muted mt-1 font-mono">
          Immutable history for policies, prompts, models, and runtime config.
        </p>
      </div>

      <Card className="border-border-default bg-bg-card">
        <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "outline"}
                size="sm"
                className="font-mono text-[0.65rem]"
                onClick={() => setFilter(f)}
              >
                {f}
              </Button>
            ))}
          </div>
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="search id, author, description…"
            className="font-mono text-xs h-8 max-w-md bg-bg-input"
          />
        </CardContent>
      </Card>

      <Card className="border-border-default bg-bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-mono text-sm text-text-primary">Changes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full font-mono text-xs">
              <thead>
                <tr className="border-b border-border-default bg-bg-editor text-left text-text-muted uppercase tracking-wider">
                  <th className="px-4 py-2 font-medium">ID</th>
                  <th className="px-4 py-2 font-medium">Type</th>
                  <th className="px-4 py-2 font-medium">Description</th>
                  <th className="px-4 py-2 font-medium">Author</th>
                  <th className="px-4 py-2 font-medium">Timestamp</th>
                  <th className="px-4 py-2 font-medium">Version</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium">Diff</th>
                </tr>
              </thead>
              <tbody className="text-text-secondary">
                {rows.map((e) => (
                  <tr key={e.id} className="border-b border-border-default hover:bg-bg-card-hover/50">
                    <td className="px-4 py-2.5 text-syntax-param whitespace-nowrap">{e.id}</td>
                    <td className="px-4 py-2.5">
                      <Badge variant={typeVariant(e.type)}>{e.type}</Badge>
                    </td>
                    <td className="px-4 py-2.5 text-text-primary max-w-[280px]">{e.desc}</td>
                    <td className="px-4 py-2.5">{e.author}</td>
                    <td className="px-4 py-2.5 text-text-muted whitespace-nowrap">{e.ts}</td>
                    <td className="px-4 py-2.5">
                      <span className="text-syntax-string">{e.from}</span>
                      <span className="text-text-muted"> → </span>
                      <span className="text-syntax-param">{e.to}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge variant={statusVariant(e.status)} className="normal-case">
                        {e.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5">
                      <button
                        type="button"
                        className={cn(
                          "text-syntax-builtin hover:text-syntax-class underline-offset-2 hover:underline"
                        )}
                      >
                        view
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
