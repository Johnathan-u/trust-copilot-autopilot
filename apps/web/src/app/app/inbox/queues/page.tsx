"use client";

import type { ComponentProps } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type QueueKey =
  | "Interested"
  | "Meeting Requested"
  | "Referral"
  | "Follow Up"
  | "Not Now (Snooze)"
  | "Dead";

type QueueCard = {
  company: string;
  lastAction: string;
  daysInQueue: number;
  priority: "P0" | "P1" | "P2";
};

const QUEUES: Record<QueueKey, { cards: QueueCard[] }> = {
  Interested: {
    cards: [
      {
        company: "Nimbus Security",
        lastAction: "Reply: scope SOC 2 walkthrough",
        daysInQueue: 1,
        priority: "P0",
      },
      {
        company: "HelioFin",
        lastAction: "Clicked proof pack CTA",
        daysInQueue: 2,
        priority: "P1",
      },
      {
        company: "CedarOps",
        lastAction: "Positive sentiment on intro mail",
        daysInQueue: 0,
        priority: "P2",
      },
    ],
  },
  "Meeting Requested": {
    cards: [
      {
        company: "BlueHarbor Finance",
        lastAction: "Proposed Tue 2pm ET slot",
        daysInQueue: 1,
        priority: "P0",
      },
      {
        company: "Northwind Travel",
        lastAction: "Security office hours request",
        daysInQueue: 3,
        priority: "P1",
      },
    ],
  },
  Referral: {
    cards: [
      {
        company: "CloudVault",
        lastAction: "Procurement referral submitted",
        daysInQueue: 2,
        priority: "P0",
      },
      {
        company: "QuantMesh",
        lastAction: "Forwarded to partner AE",
        daysInQueue: 4,
        priority: "P1",
      },
      {
        company: "Arcadia Labs",
        lastAction: "Intro to CISO buddy path",
        daysInQueue: 1,
        priority: "P2",
      },
    ],
  },
  "Follow Up": {
    cards: [
      {
        company: "Vertex Data",
        lastAction: "Trust room opened, no reply",
        daysInQueue: 5,
        priority: "P1",
      },
      {
        company: "IronGate SaaS",
        lastAction: "Bounce cleared — retry send",
        daysInQueue: 1,
        priority: "P0",
      },
    ],
  },
  "Not Now (Snooze)": {
    cards: [
      {
        company: "TrustLayer",
        lastAction: "Snoozed until Q3 renewals",
        daysInQueue: 12,
        priority: "P2",
      },
      {
        company: "LatticeWorks",
        lastAction: "Declined pilot — nurture",
        daysInQueue: 8,
        priority: "P2",
      },
      {
        company: "Polaris Health",
        lastAction: "Compliance blackout window",
        daysInQueue: 3,
        priority: "P1",
      },
    ],
  },
  Dead: {
    cards: [
      {
        company: "StaleCo Analytics",
        lastAction: "Hard bounce + invalid contact",
        daysInQueue: 30,
        priority: "P0",
      },
      {
        company: "GhostWire.io",
        lastAction: "Unsubscribe + domain suppress",
        daysInQueue: 14,
        priority: "P0",
      },
    ],
  },
};

const COLUMN_ORDER: QueueKey[] = [
  "Interested",
  "Meeting Requested",
  "Referral",
  "Follow Up",
  "Not Now (Snooze)",
  "Dead",
];

function columnHeaderTone(
  key: QueueKey
): { bar: string; title: string; subtitle: string } {
  switch (key) {
    case "Interested":
    case "Meeting Requested":
    case "Referral":
      return {
        bar: "bg-accent-green",
        title: "text-accent-green",
        subtitle: "text-syntax-string",
      };
    case "Follow Up":
    case "Not Now (Snooze)":
      return {
        bar: "bg-accent-yellow",
        title: "text-accent-yellow",
        subtitle: "text-syntax-string",
      };
    case "Dead":
      return {
        bar: "bg-accent-red",
        title: "text-accent-red",
        subtitle: "text-syntax-string",
      };
    default:
      return {
        bar: "bg-text-muted",
        title: "text-text-primary",
        subtitle: "text-text-muted",
      };
  }
}

function priorityVariant(
  p: QueueCard["priority"]
): ComponentProps<typeof Badge>["variant"] {
  switch (p) {
    case "P0":
      return "p0";
    case "P1":
      return "p1";
    default:
      return "tech";
  }
}

export default function ActionQueuesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-mono text-lg font-bold text-text-primary">
          <span className="text-syntax-builtin">def</span> action_queues
          <span className="text-text-muted">(</span>
          <span className="text-syntax-class">Manager</span>
          <span className="text-text-muted">):</span>
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Next-action queues by reply type — drag-style cards for triage
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {COLUMN_ORDER.map((key) => {
          const tone = columnHeaderTone(key);
          const { cards } = QUEUES[key];
          return (
            <Card
              key={key}
              className="border-border-default bg-bg-card flex flex-col min-h-[200px]"
            >
              <CardHeader className="pb-2 space-y-0">
                <div
                  className={cn("h-1 rounded-full mb-3", tone.bar)}
                  aria-hidden
                />
                <div className="flex items-start justify-between gap-2">
                  <CardTitle
                    className={cn(
                      "text-sm font-mono font-bold leading-tight",
                      tone.title
                    )}
                  >
                    {key}
                  </CardTitle>
                  <Badge variant="info" className="tabular-nums">
                    {cards.length}
                  </Badge>
                </div>
                <p
                  className={cn(
                    "font-mono text-[0.65rem] mt-1",
                    tone.subtitle
                  )}
                >
                  accounts
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 pt-0 flex-1">
                {cards.map((c, i) => (
                  <div
                    key={`${key}-${i}`}
                    className={cn(
                      "rounded-lg border border-border-default bg-bg-editor px-3 py-2.5",
                      "cursor-grab active:cursor-grabbing",
                      "hover:border-border-active hover:bg-bg-card-hover transition-colors"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-text-primary">
                        {c.company}
                      </span>
                      <Badge variant={priorityVariant(c.priority)}>
                        {c.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                      {c.lastAction}
                    </p>
                    <p className="font-mono text-[0.65rem] text-syntax-decorator mt-2">
                      {c.daysInQueue}d in queue
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
