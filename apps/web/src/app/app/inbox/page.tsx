"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KpiCard } from "@/components/ui/kpi-card";
import { cn } from "@/lib/utils";

type MsgStatus =
  | "pending"
  | "sent"
  | "opened"
  | "replied"
  | "bounced";
type Priority = "P0" | "P1" | "P2";

const OUTREACH = [
  {
    id: "1",
    company: "Nimbus Security",
    email: "alex.rivera@nimbussec.io",
    subject: "SOC 2 readiness — scoped assessment for your Q2 board ask",
    status: "opened" as MsgStatus,
    priority: "P0" as Priority,
    when: "Sent Mar 25, 9:14 AM",
    events: "Opened 3× · Last open 2h ago",
  },
  {
    id: "2",
    company: "CloudVault",
    email: "procurement@cloudvault.com",
    subject: "Re: vendor security packet — Trust Copilot summary attached",
    status: "replied" as MsgStatus,
    priority: "P0" as Priority,
    when: "Sent Mar 24, 4:02 PM",
    events: "Opened 2× · Replied · 1 link click",
  },
  {
    id: "3",
    company: "TrustLayer",
    email: "security@trustlayer.co",
    subject: "Follow-up: automated evidence collection for renewals",
    status: "pending" as MsgStatus,
    priority: "P1" as Priority,
    when: "Scheduled Mar 25, 2:00 PM",
    events: "—",
  },
  {
    id: "4",
    company: "IronGate SaaS",
    email: "cto@irongate.io",
    subject: "Quick win: map your controls to customer questionnaires",
    status: "sent" as MsgStatus,
    priority: "P2" as Priority,
    when: "Sent Mar 25, 8:41 AM",
    events: "Delivered · not opened yet",
  },
  {
    id: "5",
    company: "Polaris Health",
    email: "grc@polarishealth.org",
    subject: "HIPAA + SOC 2 overlap — 20-min walkthrough?",
    status: "bounced" as MsgStatus,
    priority: "P1" as Priority,
    when: "Attempted Mar 24, 11:18 AM",
    events: "Hard bounce · mailbox invalid",
  },
  {
    id: "6",
    company: "Vertex Data",
    email: "dpo@vertexdata.ai",
    subject: "Trust room invite — redacted sample for your DPA review",
    status: "opened" as MsgStatus,
    priority: "P1" as Priority,
    when: "Sent Mar 23, 6:55 PM",
    events: "Opened 1× · trust room viewed",
  },
  {
    id: "7",
    company: "BlueHarbor Finance",
    email: "vendor-risk@blueharbor.bank",
    subject: "Re: FFIEC-aligned vendor due diligence checklist",
    status: "replied" as MsgStatus,
    priority: "P0" as Priority,
    when: "Sent Mar 22, 10:30 AM",
    events: "Opened 4× · Replied · 2 CTA clicks",
  },
  {
    id: "8",
    company: "LatticeWorks",
    email: "it@latticeworks.dev",
    subject: "Security questionnaire automation — pilot slots this week",
    status: "sent" as MsgStatus,
    priority: "P2" as Priority,
    when: "Sent Mar 25, 7:05 AM",
    events: "Delivered · no opens",
  },
] as const;

const STATUS_FILTERS = [
  "All",
  "Pending",
  "Sent",
  "Opened",
  "Replied",
  "Bounced",
] as const;
const PRIORITY_FILTERS = ["All", "P0", "P1", "P2"] as const;

function statusBadgeVariant(
  s: MsgStatus
): React.ComponentProps<typeof Badge>["variant"] {
  switch (s) {
    case "pending":
      return "warning";
    case "sent":
      return "info";
    case "opened":
      return "discovery";
    case "replied":
      return "success";
    case "bounced":
      return "p0";
    default:
      return "default";
  }
}

function priorityBadgeVariant(
  p: Priority
): React.ComponentProps<typeof Badge>["variant"] {
  switch (p) {
    case "P0":
      return "p0";
    case "P1":
      return "p1";
    default:
      return "tech";
  }
}

export default function OutreachInboxPage() {
  const [status, setStatus] =
    useState<(typeof STATUS_FILTERS)[number]>("All");
  const [priority, setPriority] =
    useState<(typeof PRIORITY_FILTERS)[number]>("All");
  const [q, setQ] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-mono text-lg font-bold text-text-primary">
          <span className="text-syntax-builtin">def</span> outreach_inbox
          <span className="text-text-muted">(</span>
          <span className="text-syntax-class">View</span>
          <span className="text-text-muted">):</span>
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Sequences, drafts, and delivery telemetry across accounts
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Pending messages" value={42} accent="orange" />
        <KpiCard label="Sent today" value={186} sub="+12% vs 7d avg" accent="blue" />
        <KpiCard label="Open rate" value="41.2%" sub="rolling 14d" accent="teal" />
        <KpiCard label="Reply rate" value="8.7%" sub="rolling 14d" accent="green" />
      </div>

      <Card className="border-border-default bg-bg-editor">
        <CardContent className="space-y-4 py-4">
          <Input
            placeholder="Search company, email, or subject…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="border-border-default bg-bg-input font-mono text-xs"
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-1.5">
              <span className="font-mono text-[0.62rem] uppercase tracking-wider text-text-muted w-full sm:w-auto sm:mr-1 sm:self-center">
                Status
              </span>
              {STATUS_FILTERS.map((s) => (
                <Button
                  key={s}
                  type="button"
                  size="sm"
                  variant={status === s ? "default" : "outline"}
                  className={cn(
                    status === s &&
                      "shadow-[0_0_10px_rgba(0,122,204,0.15)]"
                  )}
                  onClick={() => setStatus(s)}
                >
                  {s}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className="font-mono text-[0.62rem] uppercase tracking-wider text-text-muted w-full sm:w-auto sm:mr-1 sm:self-center">
                Priority
              </span>
              {PRIORITY_FILTERS.map((p) => (
                <Button
                  key={p}
                  type="button"
                  size="sm"
                  variant={priority === p ? "default" : "outline"}
                  onClick={() => setPriority(p)}
                >
                  {p}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {OUTREACH.filter((row) => {
          if (status !== "All" && row.status !== status.toLowerCase())
            return false;
          if (priority !== "All" && row.priority !== priority) return false;
          if (q.trim()) {
            const needle = q.toLowerCase();
            return (
              row.company.toLowerCase().includes(needle) ||
              row.email.toLowerCase().includes(needle) ||
              row.subject.toLowerCase().includes(needle)
            );
          }
          return true;
        }).map((row) => (
          <Card
            key={row.id}
            role="button"
            tabIndex={0}
            className="cursor-pointer border-border-default bg-bg-card transition-colors hover:border-border-active hover:bg-bg-card-hover"
          >
            <CardContent className="space-y-3 py-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="font-mono text-sm font-bold text-text-primary">
                    {row.company}
                  </div>
                  <div className="font-mono text-xs text-syntax-string mt-0.5">
                    {row.email}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant={statusBadgeVariant(row.status)}>
                    {row.status}
                  </Badge>
                  <Badge variant={priorityBadgeVariant(row.priority)}>
                    {row.priority}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-text-secondary line-clamp-2">
                {row.subject}
              </p>
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border-default pt-3">
                <span className="font-mono text-[0.65rem] text-syntax-decorator">
                  {row.when}
                </span>
                <span className="font-mono text-[0.65rem] text-text-muted">
                  {row.events}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
