"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";

type QueueStatus = "draining" | "idle" | "backlogged";

const QUEUES: {
  name: string;
  items: number;
  capacity: number;
  rate: string;
  oldest: string;
  status: QueueStatus;
  barColor: string;
}[] = [
  {
    name: "Priority Queue",
    items: 128,
    capacity: 200,
    rate: "42 msg/min",
    oldest: "3m 12s",
    status: "backlogged",
    barColor: "var(--color-accent-red)",
  },
  {
    name: "Standard Queue",
    items: 54,
    capacity: 500,
    rate: "118 msg/min",
    oldest: "48s",
    status: "idle",
    barColor: "var(--color-syntax-class)",
  },
  {
    name: "Follow-up Queue",
    items: 312,
    capacity: 400,
    rate: "64 msg/min",
    oldest: "12m 05s",
    status: "draining",
    barColor: "var(--color-syntax-builtin)",
  },
  {
    name: "Retry Queue",
    items: 19,
    capacity: 80,
    rate: "9 msg/min",
    oldest: "1m 22s",
    status: "idle",
    barColor: "var(--color-accent-yellow)",
  },
];

const EVENTS = [
  {
    ts: "2025-03-25 14:02:11",
    type: "dequeued",
    account: "CloudVault",
    message: "Message 8f3a… handed to sender worker eu-west-1",
  },
  {
    ts: "2025-03-25 14:01:58",
    type: "enqueued",
    account: "Nimbus Security",
    message: "Sequence step 3 scheduled after open webhook",
  },
  {
    ts: "2025-03-25 14:01:02",
    type: "retried",
    account: "TrustLayer",
    message: "Attempt 2/5 — transient SMTP 421 from upstream",
  },
  {
    ts: "2025-03-25 13:59:44",
    type: "dead-lettered",
    account: "Polaris Health",
    message: "Hard bounce — moved to DLQ after policy max",
  },
  {
    ts: "2025-03-25 13:58:19",
    type: "dequeued",
    account: "Vertex Data",
    message: "Follow-up queue pop — SLA window 15m",
  },
  {
    ts: "2025-03-25 13:57:03",
    type: "enqueued",
    account: "BlueHarbor Finance",
    message: "Manual replay from ops console — batch id rb-9021",
  },
] as const;

function queueStatusBadge(
  s: QueueStatus
): React.ComponentProps<typeof Badge>["variant"] {
  switch (s) {
    case "backlogged":
      return "p0";
    case "draining":
      return "discovery";
    case "idle":
      return "success";
    default:
      return "default";
  }
}

function eventTypeClass(t: string) {
  switch (t) {
    case "enqueued":
      return "text-syntax-keyword";
    case "dequeued":
      return "text-syntax-builtin";
    case "retried":
      return "text-accent-yellow";
    case "dead-lettered":
      return "text-accent-red";
    default:
      return "text-text-secondary";
  }
}

export default function QueueManagerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-mono text-lg font-bold text-text-primary">
          <span className="text-syntax-builtin">def</span> queue_manager
          <span className="text-text-muted">(</span>
          <span className="text-syntax-class">Control</span>
          <span className="text-text-muted">):</span>
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Throughput, depth, and lifecycle events for outreach pipelines
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {QUEUES.map((q) => (
          <Card
            key={q.name}
            className="border-border-default bg-bg-card"
          >
            <CardHeader className="items-start justify-between gap-2 sm:flex-row">
              <div>
                <CardTitle className="text-base text-syntax-function">
                  {q.name}
                </CardTitle>
                <p className="font-mono text-[0.65rem] text-text-muted mt-1">
                  Fill vs capacity · live operator view
                </p>
              </div>
              <Badge variant={queueStatusBadge(q.status)}>{q.status}</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div>
                  <div className="font-mono text-[0.6rem] uppercase tracking-wider text-text-muted">
                    Depth
                  </div>
                  <div className="font-mono text-lg font-bold text-text-primary tabular-nums">
                    {q.items}
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[0.6rem] uppercase tracking-wider text-text-muted">
                    Capacity
                  </div>
                  <div className="font-mono text-lg font-bold text-syntax-param tabular-nums">
                    {q.capacity}
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[0.6rem] uppercase tracking-wider text-text-muted">
                    Rate
                  </div>
                  <div className="font-mono text-sm font-semibold text-syntax-string">
                    {q.rate}
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[0.6rem] uppercase tracking-wider text-text-muted">
                    Oldest
                  </div>
                  <div className="font-mono text-sm font-semibold text-accent-orange">
                    {q.oldest}
                  </div>
                </div>
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between font-mono text-[0.62rem] text-text-secondary">
                  <span>Utilization</span>
                  <span className="tabular-nums text-syntax-decorator">
                    {q.items}/{q.capacity}
                  </span>
                </div>
                <ProgressBar
                  value={q.items}
                  max={q.capacity}
                  color={q.barColor}
                  showLabel
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden border-border-default bg-bg-editor">
        <CardHeader className="py-3">
          <CardTitle>Recent queue events</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left border-collapse">
              <thead>
                <tr className="border-b border-border-default bg-bg-card font-mono text-[0.62rem] uppercase tracking-wider text-text-muted">
                  <th className="px-5 py-3 font-medium">Timestamp</th>
                  <th className="px-5 py-3 font-medium">Event</th>
                  <th className="px-5 py-3 font-medium">Account</th>
                  <th className="px-5 py-3 font-medium">Message</th>
                </tr>
              </thead>
              <tbody>
                {EVENTS.map((e, i) => (
                  <tr
                    key={i}
                    className="border-b border-border-default last:border-0 hover:bg-bg-card-hover/60 transition-colors"
                  >
                    <td className="px-5 py-3 font-mono text-xs text-syntax-decorator whitespace-nowrap">
                      {e.ts}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          "font-mono text-xs font-semibold uppercase tracking-wide",
                          eventTypeClass(e.type)
                        )}
                      >
                        {e.type.replace("-", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-text-primary">
                      {e.account}
                    </td>
                    <td className="px-5 py-3 text-xs text-text-secondary max-w-[380px]">
                      {e.message}
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
