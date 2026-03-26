"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const INCIDENTS = [
  {
    id: "INC-2403",
    severity: "p0" as const,
    title: "Outbound queue backlog — east region",
    started: "2025-03-24 06:12 UTC",
    duration: "2h 14m",
    status: "investigating" as const,
    systems: "send-worker, redis-queue",
    assignee: "oncall@tc.io",
  },
  {
    id: "INC-2402",
    severity: "p1" as const,
    title: "Elevated bounce rate on cert.trustcopilot.com",
    started: "2025-03-23 14:40 UTC",
    duration: "48m",
    status: "monitoring" as const,
    systems: "deliverability, dns",
    assignee: "sre@tc.io",
  },
  {
    id: "INC-2401",
    severity: "p1" as const,
    title: "Model scoring latency p99 > 800ms",
    started: "2025-03-22 09:05 UTC",
    duration: "1h 02m",
    status: "resolved" as const,
    systems: "ranking-api, gpu-pool",
    assignee: "ml@tc.io",
  },
  {
    id: "INC-2398",
    severity: "p0" as const,
    title: "Trust room upload failures (5xx)",
    started: "2025-03-21 22:18 UTC",
    duration: "3h 40m",
    status: "resolved" as const,
    systems: "storage, ingress",
    assignee: "oncall@tc.io",
  },
];

const REPLAYS = [
  {
    id: "RPL-8891",
    account: "Vertex Analytics Inc.",
    orig: "skip_queue",
    replay: "enter_sequence",
    changed: true,
    by: "alex@tc.io",
    time: "2025-03-24 11:02",
  },
  {
    id: "RPL-8890",
    account: "Northwind Labs",
    orig: "send_immediately",
    replay: "send_immediately",
    changed: false,
    by: "system",
    time: "2025-03-24 10:41",
  },
  {
    id: "RPL-8887",
    account: "Globex Systems",
    orig: "low_priority",
    replay: "high_priority",
    changed: true,
    by: "sam@tc.io",
    time: "2025-03-24 09:15",
  },
  {
    id: "RPL-8884",
    account: "Helios Data Co.",
    orig: "block_domain",
    replay: "allow_domain",
    changed: true,
    by: "jordan@tc.io",
    time: "2025-03-23 16:48",
  },
  {
    id: "RPL-8881",
    account: "Blue River AI",
    orig: "enrich_only",
    replay: "enrich_only",
    changed: false,
    by: "system",
    time: "2025-03-23 14:22",
  },
];

function StatusBadge({ status }: { status: "investigating" | "resolved" | "monitoring" }) {
  if (status === "resolved") return <Badge variant="success">resolved</Badge>;
  if (status === "monitoring") return <Badge variant="warning">monitoring</Badge>;
  return <Badge variant="info">investigating</Badge>;
}

export default function OpsConsolePage() {
  return (
    <div className="space-y-6 bg-bg-root min-h-full">
      <div>
        <h1 className="font-mono text-lg font-bold text-text-primary">
          <span className="text-syntax-builtin">def</span> ops_console
          <span className="text-text-muted">(</span>
          <span className="text-syntax-class">Manage</span>
          <span className="text-text-muted">):</span>
        </h1>
        <p className="text-xs text-text-muted mt-1 font-mono">
          Incidents, deterministic replays, and emergency controls.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border-default bg-bg-card hover:bg-bg-card-hover transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="font-mono text-sm text-text-primary">Replay Decision</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-text-secondary font-mono leading-relaxed">
              Replay a decision for an account with audit trail. Uses frozen policy snapshot when available.
            </p>
            <Input placeholder="account_id / domain" className="font-mono text-xs h-8 bg-bg-input" />
            <Button variant="outline" size="sm" className="w-full font-mono">
              Open replay
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border-default bg-bg-card hover:bg-bg-card-hover transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="font-mono text-sm text-text-primary">Backfill Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-text-secondary font-mono leading-relaxed">
              Re-run enrichment and signal fusion for a cohort. Idempotent jobs with progress in queue dashboard.
            </p>
            <Input placeholder="cohort / segment id" className="font-mono text-xs h-8 bg-bg-input" />
            <Button variant="outline" size="sm" className="w-full font-mono">
              Start backfill
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border-default bg-bg-card border-accent-red/30 hover:bg-bg-card-hover transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="font-mono text-sm text-accent-red">Kill Switch</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-text-secondary font-mono leading-relaxed">
              Emergency stop for outbound sends and scoring. Requires break-glass reason; notifies #incidents.
            </p>
            <Input placeholder="reason (required)" className="font-mono text-xs h-8 bg-bg-input" />
            <Button variant="destructive" size="sm" className="w-full font-mono">
              Arm kill switch
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border-default bg-bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-mono text-sm text-text-primary">Active incidents</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full font-mono text-xs">
              <thead>
                <tr className="border-b border-border-default bg-bg-editor text-left text-text-muted uppercase tracking-wider">
                  <th className="px-4 py-2 font-medium">ID</th>
                  <th className="px-4 py-2 font-medium">Severity</th>
                  <th className="px-4 py-2 font-medium">Title</th>
                  <th className="px-4 py-2 font-medium">Started</th>
                  <th className="px-4 py-2 font-medium">Duration</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium">Affected</th>
                  <th className="px-4 py-2 font-medium">Assignee</th>
                </tr>
              </thead>
              <tbody className="text-text-secondary">
                {INCIDENTS.map((i) => (
                  <tr key={i.id} className="border-b border-border-default hover:bg-bg-card-hover/50">
                    <td className="px-4 py-2.5 text-syntax-param whitespace-nowrap">{i.id}</td>
                    <td className="px-4 py-2.5">
                      <Badge variant={i.severity === "p0" ? "p0" : "p1"}>{i.severity}</Badge>
                    </td>
                    <td className="px-4 py-2.5 text-text-primary max-w-[220px]">{i.title}</td>
                    <td className="px-4 py-2.5 text-text-muted whitespace-nowrap">{i.started}</td>
                    <td className="px-4 py-2.5">{i.duration}</td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={i.status} />
                    </td>
                    <td className="px-4 py-2.5 text-syntax-class max-w-[160px]">{i.systems}</td>
                    <td className="px-4 py-2.5 text-text-muted">{i.assignee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border-default bg-bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-mono text-sm text-text-primary">Replay log</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full font-mono text-xs">
              <thead>
                <tr className="border-b border-border-default bg-bg-editor text-left text-text-muted uppercase tracking-wider">
                  <th className="px-4 py-2 font-medium">Replay ID</th>
                  <th className="px-4 py-2 font-medium">Account</th>
                  <th className="px-4 py-2 font-medium">Original</th>
                  <th className="px-4 py-2 font-medium">Replayed</th>
                  <th className="px-4 py-2 font-medium">Changed?</th>
                  <th className="px-4 py-2 font-medium">Triggered By</th>
                  <th className="px-4 py-2 font-medium">Time</th>
                </tr>
              </thead>
              <tbody className="text-text-secondary">
                {REPLAYS.map((r) => (
                  <tr key={r.id} className="border-b border-border-default hover:bg-bg-card-hover/50">
                    <td className="px-4 py-2.5 text-syntax-param">{r.id}</td>
                    <td className="px-4 py-2.5 text-text-primary">{r.account}</td>
                    <td className="px-4 py-2.5">{r.orig}</td>
                    <td className="px-4 py-2.5">{r.replay}</td>
                    <td className="px-4 py-2.5">
                      {r.changed ? (
                        <span className="text-accent-yellow">yes</span>
                      ) : (
                        <span className="text-text-muted">no</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">{r.by}</td>
                    <td className="px-4 py-2.5 text-text-muted">{r.time}</td>
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
