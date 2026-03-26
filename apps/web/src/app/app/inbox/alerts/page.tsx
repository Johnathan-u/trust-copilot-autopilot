"use client";

import { useMemo, useState, type ComponentProps } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/ui/kpi-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";

type Severity = "critical" | "warning" | "info";

type DomainRow = {
  domain: string;
  status: "healthy" | "warning" | "paused";
  bouncePct: number;
  complaintPct: number;
  dailySendUsed: number;
  dailySendCap: number;
  autoPause: "off" | "armed" | "active";
};

type AlertItem = {
  id: string;
  ts: string;
  severity: Severity;
  message: string;
  entity: string;
  resolved: boolean;
};

const DOMAINS: DomainRow[] = [
  {
    domain: "outreach.trustcopilot.io",
    status: "healthy",
    bouncePct: 2.1,
    complaintPct: 0.02,
    dailySendUsed: 8400,
    dailySendCap: 12000,
    autoPause: "off",
  },
  {
    domain: "replies.gtm.acme.com",
    status: "warning",
    bouncePct: 4.8,
    complaintPct: 0.09,
    dailySendUsed: 10800,
    dailySendCap: 12000,
    autoPause: "armed",
  },
  {
    domain: "mail.seq.vendor.io",
    status: "paused",
    bouncePct: 6.4,
    complaintPct: 0.14,
    dailySendUsed: 3200,
    dailySendCap: 8000,
    autoPause: "active",
  },
  {
    domain: "notify.hq.corp.net",
    status: "healthy",
    bouncePct: 1.2,
    complaintPct: 0.03,
    dailySendUsed: 4100,
    dailySendCap: 10000,
    autoPause: "off",
  },
];

const MOCK_ALERTS: AlertItem[] = [
  {
    id: "1",
    ts: "2025-03-25 14:02 UTC",
    severity: "critical",
    message: "Hard bounce rate on mail.seq.vendor.io crossed emergency threshold vs 24h baseline.",
    entity: "mail.seq.vendor.io",
    resolved: false,
  },
  {
    id: "2",
    ts: "2025-03-25 13:58 UTC",
    severity: "warning",
    message: "Complaint ratio climbing on template variant B — FBL cluster detected.",
    entity: "replies.gtm.acme.com",
    resolved: false,
  },
  {
    id: "3",
    ts: "2025-03-25 13:41 UTC",
    severity: "info",
    message: "Policy simulator: proposed cap would throttle 3% of sequence volume.",
    entity: "acct_seq_global",
    resolved: true,
  },
  {
    id: "4",
    ts: "2025-03-25 12:22 UTC",
    severity: "critical",
    message: "Mailbox pool soft-bounce storm — auto-pause engaged for EU cohort.",
    entity: "pool_outbound_03",
    resolved: false,
  },
  {
    id: "5",
    ts: "2025-03-25 11:05 UTC",
    severity: "warning",
    message: "Bounce rate within 0.2pp of 5% policy line on warmup domain.",
    entity: "replies.gtm.acme.com",
    resolved: false,
  },
  {
    id: "6",
    ts: "2025-03-25 09:47 UTC",
    severity: "info",
    message: "Complaint webhook replay completed — no duplicate escalations.",
    entity: "notify.hq.corp.net",
    resolved: true,
  },
  {
    id: "7",
    ts: "2025-03-25 08:30 UTC",
    severity: "warning",
    message: "Per-domain velocity at 94% of rolling hourly limiter budget.",
    entity: "outreach.trustcopilot.io",
    resolved: true,
  },
  {
    id: "8",
    ts: "2025-03-25 07:12 UTC",
    severity: "critical",
    message: "Sudden complaint burst in EU — sequences paused pending review.",
    entity: "replies.gtm.acme.com",
    resolved: false,
  },
];

const SEVERITY_FILTERS = ["All", "Critical", "Warning", "Info"] as const;

function domainStatusBadge(
  s: DomainRow["status"]
): ComponentProps<typeof Badge>["variant"] {
  switch (s) {
    case "healthy":
      return "success";
    case "warning":
      return "p1";
    case "paused":
      return "p0";
    default:
      return "default";
  }
}

function autoPauseBadge(
  a: DomainRow["autoPause"]
): ComponentProps<typeof Badge>["variant"] {
  switch (a) {
    case "off":
      return "success";
    case "armed":
      return "warning";
    case "active":
      return "p0";
    default:
      return "default";
  }
}

function BounceBarWithThreshold({ value }: { value: number }) {
  const barColor =
    value >= 5
      ? "var(--color-accent-red)"
      : value >= 4
        ? "var(--color-accent-yellow)"
        : "var(--color-accent-green)";

  return (
    <div className="space-y-1">
      <div className="flex justify-between font-mono text-[0.62rem] text-text-secondary">
        <span>Bounce rate</span>
        <span className="tabular-nums text-syntax-param">{value}%</span>
      </div>
      <div className="relative pt-0.5">
        <div
          className="pointer-events-none absolute left-[5%] top-0 bottom-0 w-px bg-accent-yellow z-10"
          title="5% threshold"
          aria-hidden
        />
        <ProgressBar value={Math.min(value, 15)} max={15} color={barColor} />
        <div className="font-mono text-[0.55rem] text-text-muted mt-0.5">
          threshold <span className="text-accent-yellow">5%</span> (shown on bar)
        </div>
      </div>
    </div>
  );
}

export default function SafetyAlertsPage() {
  const [severity, setSeverity] =
    useState<(typeof SEVERITY_FILTERS)[number]>("All");

  const visible = useMemo(() => {
    return MOCK_ALERTS.filter((a) => {
      if (severity === "All") return true;
      if (severity === "Critical") return a.severity === "critical";
      if (severity === "Warning") return a.severity === "warning";
      if (severity === "Info") return a.severity === "info";
      return true;
    });
  }, [severity]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-mono text-lg font-bold text-text-primary">
          <span className="text-syntax-builtin">def</span> safety_alerts
          <span className="text-text-muted">(</span>
          <span className="text-syntax-class">Monitor</span>
          <span className="text-text-muted">):</span>
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Complaints, bounces, and auto-pause signals across sending domains
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Active alerts" value={5} accent="orange" />
        <KpiCard label="Bounces (24h)" value={142} sub="hard + soft" accent="red" />
        <KpiCard label="Complaints (24h)" value={18} accent="orange" />
        <KpiCard label="Auto-paused domains" value={1} accent="purple" />
      </div>

      <Card className="border-border-default bg-bg-editor">
        <CardContent className="py-4 space-y-3">
          <span className="font-mono text-[0.62rem] uppercase tracking-wider text-text-muted">
            Severity
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SEVERITY_FILTERS.map((s) => (
              <Button
                key={s}
                type="button"
                size="sm"
                variant={severity === s ? "default" : "outline"}
                onClick={() => setSeverity(s)}
              >
                {s}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="font-mono text-sm font-bold text-text-primary mb-3">
          Domain health
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {DOMAINS.map((d) => (
            <Card
              key={d.domain}
              className="border-border-default bg-bg-card"
            >
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-sm font-mono text-syntax-function break-all">
                    {d.domain}
                  </CardTitle>
                  <Badge variant={domainStatusBadge(d.status)} className="capitalize">
                    {d.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <BounceBarWithThreshold value={d.bouncePct} />
                <div>
                  <div className="font-mono text-[0.62rem] uppercase tracking-wider text-text-muted mb-1">
                    Complaint rate
                  </div>
                  <div className="font-mono text-sm font-semibold text-syntax-param tabular-nums">
                    {d.complaintPct}%
                  </div>
                </div>
                <div>
                  <div className="mb-1.5 flex items-center justify-between font-mono text-[0.62rem] text-text-secondary">
                    <span>Daily send usage</span>
                    <span className="tabular-nums text-syntax-decorator">
                      {d.dailySendUsed.toLocaleString()} /{" "}
                      {d.dailySendCap.toLocaleString()}
                    </span>
                  </div>
                  <ProgressBar
                    value={d.dailySendUsed}
                    max={d.dailySendCap}
                    color="var(--color-syntax-builtin)"
                    showLabel
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border-default">
                  <span className="font-mono text-[0.62rem] text-text-muted">
                    Auto-pause
                  </span>
                  <Badge variant={autoPauseBadge(d.autoPause)} className="uppercase">
                    {d.autoPause}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-mono text-sm font-bold text-text-primary mb-3">
          Alert feed
        </h2>
        <div className="space-y-3">
          {visible.map((a) => (
            <article
              key={a.id}
              className={cn(
                "rounded-xl border border-border-default bg-bg-editor px-4 py-3.5 transition-colors hover:bg-bg-card-hover",
                a.severity === "critical" && "border-l-4 border-l-accent-red",
                a.severity === "warning" && "border-l-4 border-l-accent-yellow"
              )}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[0.65rem] text-syntax-decorator">
                  {a.ts}
                </span>
                <Badge
                  variant={
                    a.severity === "critical"
                      ? "p0"
                      : a.severity === "warning"
                        ? "p1"
                        : "info"
                  }
                  className="capitalize"
                >
                  {a.severity}
                </Badge>
                <Badge
                  variant={a.resolved ? "success" : "warning"}
                  className="normal-case"
                >
                  {a.resolved ? "Resolved" : "Open"}
                </Badge>
              </div>
              <p className="text-sm text-text-secondary mt-2 leading-relaxed">
                {a.message}
              </p>
              <p className="font-mono text-xs text-text-muted mt-2">
                <span className="text-syntax-keyword">entity</span>
                <span className="text-text-muted">(</span>
                <span className="text-syntax-string">{a.entity}</span>
                <span className="text-text-muted">)</span>
              </p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
