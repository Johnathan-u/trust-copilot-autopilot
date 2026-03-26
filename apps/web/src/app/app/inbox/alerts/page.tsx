"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Circle, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Severity = "critical" | "warning" | "info";
type AlertType = "bounce" | "complaint" | "rate_limit" | "system";

type AlertItem = {
  id: string;
  ts: string;
  severity: Severity;
  type: AlertType;
  title: string;
  description: string;
  entity: string;
  entityKind: "account" | "domain";
  action: "auto-paused" | "escalated" | "ignored";
  resolved: boolean;
};

const MOCK_ALERTS: AlertItem[] = [
  {
    id: "1",
    ts: "2025-03-25 14:02:11 UTC",
    severity: "critical",
    type: "bounce",
    title: "Bounce rate spike on sequences domain",
    description: "Hard bounces exceeded 3× trailing 24h baseline for warmup cohort.",
    entity: "mail.sequences.acme.com",
    entityKind: "domain",
    action: "auto-paused",
    resolved: false,
  },
  {
    id: "2",
    ts: "2025-03-25 13:58:44 UTC",
    severity: "warning",
    type: "complaint",
    title: "Complaint ratio approaching threshold",
    description: "FBL signals clustered on a single campaign template variant.",
    entity: "acct_8f2k1m",
    entityKind: "account",
    action: "escalated",
    resolved: false,
  },
  {
    id: "3",
    ts: "2025-03-25 13:41:02 UTC",
    severity: "info",
    type: "rate_limit",
    title: "ESP throttle observed",
    description: "Provider returned 429 on 2% of attempts; backoff engaged for 15 minutes.",
    entity: "outreach.trustcopilot.io",
    entityKind: "domain",
    action: "ignored",
    resolved: true,
  },
  {
    id: "4",
    ts: "2025-03-25 12:22:33 UTC",
    severity: "critical",
    type: "system",
    title: "Queue worker heartbeat missed",
    description: "dispatch-worker-east did not emit heartbeat for 3 intervals.",
    entity: "acct_ops_global",
    entityKind: "account",
    action: "escalated",
    resolved: false,
  },
  {
    id: "5",
    ts: "2025-03-25 11:05:19 UTC",
    severity: "warning",
    type: "bounce",
    title: "Soft bounce cluster on mailbox pool",
    description: "Temporary failures concentrated on mx fallback route.",
    entity: "pool_outbound_03",
    entityKind: "account",
    action: "auto-paused",
    resolved: false,
  },
  {
    id: "6",
    ts: "2025-03-25 09:47:51 UTC",
    severity: "info",
    type: "system",
    title: "Policy simulator dry-run completed",
    description: "No violations; 12 sequences would be capped under proposed limits.",
    entity: "acct_8f2k1m",
    entityKind: "account",
    action: "ignored",
    resolved: true,
  },
  {
    id: "7",
    ts: "2025-03-25 08:30:08 UTC",
    severity: "warning",
    type: "rate_limit",
    title: "Per-domain velocity near cap",
    description: "seq.notify.company.co at 94% of rolling hourly limiter budget.",
    entity: "seq.notify.company.co",
    entityKind: "domain",
    action: "ignored",
    resolved: true,
  },
  {
    id: "8",
    ts: "2025-03-25 07:12:40 UTC",
    severity: "critical",
    type: "complaint",
    title: "Sudden complaint burst",
    description: "Complaints per thousand sends crossed emergency threshold in EU region.",
    entity: "replies.gtm.smtp.internal",
    entityKind: "domain",
    action: "auto-paused",
    resolved: false,
  },
];

const SEVERITY_FILTERS = ["all", "critical", "warning", "info"] as const;
const TYPE_FILTERS = ["all", "bounce", "complaint", "rate_limit", "system"] as const;

function SeverityIcon({ severity }: { severity: Severity }) {
  if (severity === "critical") {
    return <Circle className="size-4 fill-accent-red text-accent-red" aria-hidden />;
  }
  if (severity === "warning") {
    return <AlertTriangle className="size-4 text-accent-yellow" aria-hidden />;
  }
  return <Info className="size-4 text-syntax-builtin" aria-hidden />;
}

function typeLabel(t: AlertType) {
  switch (t) {
    case "bounce":
      return "Bounce";
    case "complaint":
      return "Complaint";
    case "rate_limit":
      return "Rate limit";
    case "system":
      return "System";
    default:
      return t;
  }
}

export default function AlertFeedPage() {
  const [severity, setSeverity] = useState<(typeof SEVERITY_FILTERS)[number]>("all");
  const [type, setType] = useState<(typeof TYPE_FILTERS)[number]>("all");

  const visible = useMemo(() => {
    return MOCK_ALERTS.filter((a) => {
      if (severity !== "all" && a.severity !== severity) return false;
      if (type !== "all" && a.type !== type) return false;
      return true;
    });
  }, [severity, type]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-mono text-lg font-bold text-text-primary">
          <span className="text-syntax-builtin">def</span> alert_feed
          <span className="text-text-muted">(</span>
          <span className="text-syntax-class">Monitor</span>
          <span className="text-text-muted">):</span>
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Live deliverability and system signals with escalation hooks
        </p>
      </div>

      <div className="space-y-3 rounded-xl border border-border-default bg-bg-card p-4">
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[0.62rem] uppercase tracking-wider text-text-muted">
            Severity
          </span>
          <div className="flex flex-wrap gap-2">
            {SEVERITY_FILTERS.map((s) => (
              <Button
                key={s}
                type="button"
                size="sm"
                variant={severity === s ? "default" : "outline"}
                className="capitalize"
                onClick={() => setSeverity(s)}
              >
                {s === "all" ? "All" : s}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2 pt-1 border-t border-border-default">
          <span className="font-mono text-[0.62rem] uppercase tracking-wider text-text-muted">
            Type
          </span>
          <div className="flex flex-wrap gap-2">
            {TYPE_FILTERS.map((t) => (
              <Button
                key={t}
                type="button"
                size="sm"
                variant={type === t ? "default" : "outline"}
                className="font-mono normal-case"
                onClick={() => setType(t)}
              >
                {t === "all" ? "All" : typeLabel(t as AlertType)}
              </Button>
            ))}
          </div>
        </div>
      </div>

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
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-3 min-w-0">
                <div className="mt-0.5 shrink-0" title={a.severity}>
                  <SeverityIcon severity={a.severity} />
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[0.65rem] text-syntax-builtin">{a.ts}</span>
                    <Badge
                      variant={a.severity === "critical" ? "p0" : a.severity === "warning" ? "p1" : "info"}
                      className="capitalize"
                    >
                      {a.severity}
                    </Badge>
                    <Badge variant="default" className="normal-case">
                      {typeLabel(a.type)}
                    </Badge>
                    {a.resolved && (
                      <Badge variant="success" className="normal-case">
                        Resolved
                      </Badge>
                    )}
                  </div>
                  <h2 className="font-mono text-sm font-semibold text-text-primary">{a.title}</h2>
                  <p className="text-xs text-text-secondary leading-relaxed">{a.description}</p>
                  <p className="font-mono text-xs text-text-muted">
                    <span className="text-syntax-keyword">affected</span>
                    <span className="text-text-muted">(</span>
                    <span className="text-syntax-string">{a.entityKind}</span>
                    <span className="text-text-muted">=</span>
                    <span className="text-syntax-param">{a.entity}</span>
                    <span className="text-text-muted">)</span>
                  </p>
                  <p className="font-mono text-xs">
                    <span className="text-syntax-decorator">@action</span>{" "}
                    <span className="text-syntax-function">{a.action}</span>
                  </p>
                </div>
              </div>
              {!a.resolved && (
                <div className="flex shrink-0 gap-2 sm:flex-col sm:items-stretch">
                  <Button variant="outline" size="sm">
                    Acknowledge
                  </Button>
                  <Button variant="destructive" size="sm">
                    Escalate
                  </Button>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
