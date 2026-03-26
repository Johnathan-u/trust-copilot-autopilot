"use client";

import { useState } from "react";
import { Globe, Plus, Pause, Play, RotateCcw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Source {
  id: string;
  domain: string;
  type: "company_site" | "job_board" | "rss" | "trust_page" | "press";
  status: "active" | "paused" | "erroring";
  lastRun: string;
  pagesTotal: number;
  signalsTotal: number;
  successRate: number;
  priority: number;
  tags: string[];
}

const MOCK_SOURCES: Source[] = [
  { id: "s1", domain: "greenhouse.io/jobs", type: "job_board", status: "active", lastRun: "12m ago", pagesTotal: 24530, signalsTotal: 1842, successRate: 0.96, priority: 1, tags: ["high-yield"] },
  { id: "s2", domain: "lever.co/jobs", type: "job_board", status: "active", lastRun: "18m ago", pagesTotal: 18200, signalsTotal: 1320, successRate: 0.93, priority: 1, tags: ["high-yield"] },
  { id: "s3", domain: "techcrunch.com/security", type: "rss", status: "active", lastRun: "5m ago", pagesTotal: 4200, signalsTotal: 890, successRate: 0.98, priority: 2, tags: ["news", "funding"] },
  { id: "s4", domain: "securityweek.com", type: "press", status: "active", lastRun: "22m ago", pagesTotal: 3100, signalsTotal: 520, successRate: 0.95, priority: 2, tags: ["news"] },
  { id: "s5", domain: "trustpage.com/directory", type: "trust_page", status: "active", lastRun: "1h ago", pagesTotal: 8400, signalsTotal: 2100, successRate: 0.91, priority: 1, tags: ["trust-center"] },
  { id: "s6", domain: "indeed.com/security-jobs", type: "job_board", status: "erroring", lastRun: "3h ago", pagesTotal: 15600, signalsTotal: 980, successRate: 0.42, priority: 3, tags: ["degraded"] },
  { id: "s7", domain: "linkedin.com/jobs", type: "job_board", status: "paused", lastRun: "2d ago", pagesTotal: 32000, signalsTotal: 2400, successRate: 0.88, priority: 4, tags: ["rate-limited"] },
  { id: "s8", domain: "soc2.fyi", type: "trust_page", status: "active", lastRun: "45m ago", pagesTotal: 1200, signalsTotal: 680, successRate: 0.97, priority: 2, tags: ["trust-center"] },
];

const typeColors: Record<string, string> = {
  company_site: "discovery", job_board: "qualification", rss: "info", trust_page: "tech", press: "warning",
};
const statusColors: Record<string, { dot: string; text: string }> = {
  active: { dot: "bg-accent-green", text: "text-accent-green" },
  paused: { dot: "bg-accent-yellow", text: "text-accent-yellow" },
  erroring: { dot: "bg-accent-red", text: "text-accent-red" },
};

export default function SourceRegistryPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = MOCK_SOURCES.filter((s) => {
    if (search && !s.domain.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter !== "all" && s.type !== typeFilter) return false;
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mono text-lg font-bold text-text-primary">
            <span className="text-syntax-builtin">def</span> source_registry
            <span className="text-text-muted">(</span>
            <span className="text-syntax-class">View</span>
            <span className="text-text-muted">):</span>
          </h1>
          <p className="text-xs text-text-muted mt-1">Manage, tag, pause, and prioritize crawl sources</p>
        </div>
        <Button size="sm"><Plus size={13} /> Add Source</Button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <Input placeholder="Search domains..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-56 h-7 text-[0.68rem]" />
        <div className="flex items-center gap-1">
          {["all", "job_board", "rss", "trust_page", "company_site", "press"].map((t) => (
            <Button key={t} variant={typeFilter === t ? "default" : "outline"} size="sm" onClick={() => setTypeFilter(t)} className="text-[0.6rem] h-6 px-2">
              {t === "all" ? "All Types" : t.replace(/_/g, " ")}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          {["all", "active", "paused", "erroring"].map((s) => (
            <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(s)} className="text-[0.6rem] h-6 px-2">
              {s === "all" ? "All Status" : s}
            </Button>
          ))}
        </div>
        <span className="font-mono text-[0.62rem] text-text-muted ml-auto">{filtered.length} sources</span>
      </div>

      <div className="rounded-xl border border-border-default bg-bg-editor overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-default">
              {["Domain", "Type", "Status", "Last Run", "Pages", "Signals", "Success", "Priority", "Actions"].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left font-mono text-[0.6rem] font-semibold text-text-muted uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => {
              const sc = statusColors[s.status];
              return (
                <tr key={s.id} className="border-b border-border-default hover:bg-bg-card transition-colors">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <Globe size={13} className="text-text-muted shrink-0" />
                      <span className="font-mono text-xs text-text-primary font-medium truncate max-w-[200px]">{s.domain}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5"><Badge variant={typeColors[s.type] as any}>{s.type.replace(/_/g, " ")}</Badge></td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className={cn("h-2 w-2 rounded-full", sc.dot)} />
                      <span className={cn("font-mono text-[0.65rem] font-medium capitalize", sc.text)}>{s.status}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-[0.68rem] text-text-muted">{s.lastRun}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-text-secondary">{s.pagesTotal.toLocaleString()}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-syntax-class">{s.signalsTotal.toLocaleString()}</td>
                  <td className="px-4 py-2.5">
                    <span className={cn("font-mono text-xs font-semibold", s.successRate >= 0.9 ? "text-accent-green" : s.successRate >= 0.7 ? "text-accent-yellow" : "text-accent-red")}>
                      {(s.successRate * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-syntax-decorator">P{s.priority}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1">
                      {s.status === "active" ? (
                        <Button variant="ghost" size="icon" className="h-6 w-6"><Pause size={11} /></Button>
                      ) : (
                        <Button variant="ghost" size="icon" className="h-6 w-6"><Play size={11} /></Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-6 w-6"><RotateCcw size={11} /></Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6"><ExternalLink size={11} /></Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
