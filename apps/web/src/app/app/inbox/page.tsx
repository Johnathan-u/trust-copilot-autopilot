"use client";

import { useMemo, useState, type ComponentProps } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KpiCard } from "@/components/ui/kpi-card";
import {
  ThreadDetail,
  type MockThread,
} from "@/components/inbox/thread-detail";
import { cn } from "@/lib/utils";

const CLASS_FILTERS = [
  "All",
  "Interested",
  "Meeting Booked",
  "Referral",
  "Not Now",
  "Unsubscribe",
  "Bounce",
  "No Reply",
] as const;

const MOCK_THREADS: MockThread[] = [
  {
    id: "t1",
    company: "Nimbus Security",
    preview:
      "Thanks for the SOC 2 packet — can we book 30m next week to walk through gaps?",
    classification: "Interested",
    time: "12m ago",
    unread: true,
    messages: [
      {
        id: "m1",
        direction: "sent",
        body: "Hi Alex — sharing our Trust Copilot summary and a redacted sample trust room for board prep.",
        time: "Mar 25, 9:14 AM",
      },
      {
        id: "m2",
        direction: "received",
        body: "Thanks for the SOC 2 packet — can we book 30m next week to walk through gaps?",
        time: "Mar 25, 10:02 AM",
      },
    ],
    replyClassification: "Interested",
    sentiment: "positive",
    suggestedNextAction: "Send calendar hold + security questionnaire intake link.",
    replyEvents: [
      {
        id: "r1",
        ts: "Mar 25, 9:14",
        direction: "sent",
        classification: "Outreach",
        confidence: 99,
      },
      {
        id: "r2",
        ts: "Mar 25, 10:02",
        direction: "received",
        classification: "Interested",
        confidence: 91,
      },
    ],
  },
  {
    id: "t2",
    company: "CloudVault",
    preview: "Looping in procurement — please use this referral form for vendor onboarding.",
    classification: "Referral",
    time: "1h ago",
    unread: true,
    messages: [
      {
        id: "m1",
        direction: "sent",
        body: "Attached vendor security summary — happy to align with your DPA checklist.",
        time: "Mar 24, 4:02 PM",
      },
      {
        id: "m2",
        direction: "received",
        body: "Looping in procurement — please use this referral form for vendor onboarding.",
        time: "Mar 24, 5:18 PM",
      },
      {
        id: "m3",
        direction: "sent",
        body: "Perfect — submitted via portal ref #CV-9021.",
        time: "Mar 24, 5:22 PM",
      },
    ],
    replyClassification: "Referral",
    sentiment: "positive",
    suggestedNextAction: "Tag partner AE + attach procurement thread ID.",
    replyEvents: [
      {
        id: "r1",
        ts: "Mar 24, 16:02",
        direction: "sent",
        classification: "Outreach",
        confidence: 98,
      },
      {
        id: "r2",
        ts: "Mar 24, 17:18",
        direction: "received",
        classification: "Referral",
        confidence: 88,
      },
      {
        id: "r3",
        ts: "Mar 24, 17:22",
        direction: "sent",
        classification: "Ack",
        confidence: 72,
      },
    ],
  },
  {
    id: "t3",
    company: "BlueHarbor Finance",
    preview: "We need a 45-min FFIEC-aligned session — Tuesday 2pm ET works.",
    classification: "Meeting Booked",
    time: "2h ago",
    unread: false,
    messages: [
      {
        id: "m1",
        direction: "sent",
        body: "Following up on FFIEC vendor diligence — we can map controls to your questionnaire.",
        time: "Mar 22, 10:30 AM",
      },
      {
        id: "m2",
        direction: "received",
        body: "We need a 45-min FFIEC-aligned session — Tuesday 2pm ET works.",
        time: "Mar 22, 11:05 AM",
      },
    ],
    replyClassification: "Meeting Booked",
    sentiment: "positive",
    suggestedNextAction: "Create invite with agenda + attendee list from thread.",
    replyEvents: [
      {
        id: "r1",
        ts: "Mar 22, 10:30",
        direction: "sent",
        classification: "Outreach",
        confidence: 97,
      },
      {
        id: "r2",
        ts: "Mar 22, 11:05",
        direction: "received",
        classification: "Meeting Booked",
        confidence: 94,
      },
    ],
  },
  {
    id: "t4",
    company: "TrustLayer",
    preview: "Not a priority this quarter — revisit in Q3 after renewals calm down.",
    classification: "Not Now",
    time: "3h ago",
    unread: false,
    messages: [
      {
        id: "m1",
        direction: "sent",
        body: "Automated evidence collection can cut renewal prep time — quick 15m intro?",
        time: "Mar 25, 8:00 AM",
      },
      {
        id: "m2",
        direction: "received",
        body: "Not a priority this quarter — revisit in Q3 after renewals calm down.",
        time: "Mar 25, 8:44 AM",
      },
    ],
    replyClassification: "Not Now",
    sentiment: "neutral",
    suggestedNextAction: "Snooze 90d + add to nurture track “renewal season”.",
    replyEvents: [
      {
        id: "r1",
        ts: "Mar 25, 08:00",
        direction: "sent",
        classification: "Outreach",
        confidence: 96,
      },
      {
        id: "r2",
        ts: "Mar 25, 08:44",
        direction: "received",
        classification: "Not Now",
        confidence: 86,
      },
    ],
  },
  {
    id: "t5",
    company: "Polaris Health",
    preview: "Please remove us from all marketing — HIPAA mailbox is not for vendors.",
    classification: "Unsubscribe",
    time: "5h ago",
    unread: true,
    messages: [
      {
        id: "m1",
        direction: "sent",
        body: "HIPAA + SOC 2 overlap walkthrough — optional 20m slot this week?",
        time: "Mar 24, 11:00 AM",
      },
      {
        id: "m2",
        direction: "received",
        body: "Please remove us from all marketing — HIPAA mailbox is not for vendors.",
        time: "Mar 24, 11:22 AM",
      },
    ],
    replyClassification: "Unsubscribe",
    sentiment: "negative",
    suggestedNextAction: "Suppress domain + log compliance note; no further outreach.",
    replyEvents: [
      {
        id: "r1",
        ts: "Mar 24, 11:00",
        direction: "sent",
        classification: "Outreach",
        confidence: 95,
      },
      {
        id: "r2",
        ts: "Mar 24, 11:22",
        direction: "received",
        classification: "Unsubscribe",
        confidence: 97,
      },
    ],
  },
  {
    id: "t6",
    company: "IronGate SaaS",
    preview: "(Auto) Mailbox unavailable — message not delivered.",
    classification: "Bounce",
    time: "6h ago",
    unread: true,
    messages: [
      {
        id: "m1",
        direction: "sent",
        body: "Quick win: map your controls to customer questionnaires.",
        time: "Mar 25, 8:41 AM",
      },
      {
        id: "m2",
        direction: "received",
        body: "(Auto) Mailbox unavailable — message not delivered.",
        time: "Mar 25, 8:42 AM",
      },
    ],
    replyClassification: "Bounce",
    sentiment: "negative",
    suggestedNextAction: "Verify MX + alternate contact; pause sequence for 48h.",
    replyEvents: [
      {
        id: "r1",
        ts: "Mar 25, 08:41",
        direction: "sent",
        classification: "Outreach",
        confidence: 99,
      },
      {
        id: "r2",
        ts: "Mar 25, 08:42",
        direction: "received",
        classification: "Bounce",
        confidence: 100,
      },
    ],
  },
  {
    id: "t7",
    company: "Vertex Data",
    preview: "Opened trust room twice — no reply yet.",
    classification: "No Reply",
    time: "1d ago",
    unread: false,
    messages: [
      {
        id: "m1",
        direction: "sent",
        body: "Trust room invite — redacted sample for your DPA review.",
        time: "Mar 23, 6:55 PM",
      },
      {
        id: "m2",
        direction: "sent",
        body: "Bumping this — happy to tailor the control mapping sheet.",
        time: "Mar 24, 6:55 PM",
      },
    ],
    replyClassification: "No Reply",
    sentiment: "neutral",
    suggestedNextAction: "Send proof-pack CTA + single-thread bump in 3d.",
    replyEvents: [
      {
        id: "r1",
        ts: "Mar 23, 18:55",
        direction: "sent",
        classification: "Outreach",
        confidence: 98,
      },
      {
        id: "r2",
        ts: "Mar 24, 18:55",
        direction: "sent",
        classification: "Bump",
        confidence: 81,
      },
    ],
  },
  {
    id: "t8",
    company: "LatticeWorks",
    preview: "Thanks — not interested in automation pilots at this time.",
    classification: "Not Now",
    time: "2d ago",
    unread: false,
    messages: [
      {
        id: "m1",
        direction: "sent",
        body: "Questionnaire automation pilot slots this week — want a slot?",
        time: "Mar 23, 7:05 AM",
      },
      {
        id: "m2",
        direction: "received",
        body: "Thanks — not interested in automation pilots at this time.",
        time: "Mar 23, 9:12 AM",
      },
    ],
    replyClassification: "Not Now",
    sentiment: "neutral",
    suggestedNextAction: "Close thread as nurture; exclude from aggressive cadence.",
    replyEvents: [
      {
        id: "r1",
        ts: "Mar 23, 07:05",
        direction: "sent",
        classification: "Outreach",
        confidence: 97,
      },
      {
        id: "r2",
        ts: "Mar 23, 09:12",
        direction: "received",
        classification: "Not Now",
        confidence: 84,
      },
    ],
  },
];

function listBadgeVariant(
  c: string
): ComponentProps<typeof Badge>["variant"] {
  switch (c) {
    case "Interested":
    case "Meeting Booked":
    case "Referral":
      return "success";
    case "Not Now":
    case "No Reply":
      return "warning";
    case "Unsubscribe":
    case "Bounce":
      return "p0";
    default:
      return "default";
  }
}

function sentimentLabel(s: MockThread["sentiment"]) {
  switch (s) {
    case "positive":
      return { text: "Positive signal", className: "text-accent-green" };
    case "negative":
      return { text: "Negative signal", className: "text-accent-red" };
    default:
      return { text: "Neutral", className: "text-accent-yellow" };
  }
}

export default function UnifiedInboxPage() {
  const [filter, setFilter] =
    useState<(typeof CLASS_FILTERS)[number]>("All");
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState(MOCK_THREADS[0]?.id ?? "");

  const filtered = useMemo(() => {
    return MOCK_THREADS.filter((t) => {
      if (filter !== "All" && t.classification !== filter) return false;
      if (q.trim()) {
        const needle = q.toLowerCase();
        return (
          t.company.toLowerCase().includes(needle) ||
          t.preview.toLowerCase().includes(needle)
        );
      }
      return true;
    });
  }, [filter, q]);

  const selected =
    filtered.find((t) => t.id === selectedId) ??
    filtered[0] ??
    MOCK_THREADS[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-mono text-lg font-bold text-text-primary">
          <span className="text-syntax-builtin">def</span> unified_inbox
          <span className="text-text-muted">(</span>
          <span className="text-syntax-class">ThreadView</span>
          <span className="text-text-muted">):</span>
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Reply threads, classifications, and suggested next actions in one view
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Active threads" value={47} accent="blue" />
        <KpiCard label="Awaiting reply" value={12} sub="SLA < 4h" accent="orange" />
        <KpiCard label="Positive signals" value={23} accent="green" />
        <KpiCard label="Avg response time" value="2h 14m" sub="rolling 7d" accent="teal" />
      </div>

      <Card className="border-border-default bg-bg-editor">
        <CardContent className="space-y-4 py-4">
          <Input
            placeholder="Search company or message preview…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="border-border-default bg-bg-input font-mono text-xs"
          />
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[0.62rem] uppercase tracking-wider text-text-muted">
              Classification
            </span>
            <div className="flex flex-wrap gap-1.5">
              {CLASS_FILTERS.map((c) => (
                <Button
                  key={c}
                  type="button"
                  size="sm"
                  variant={filter === c ? "default" : "outline"}
                  className={cn(
                    filter === c && "shadow-[0_0_10px_rgba(0,122,204,0.15)]"
                  )}
                  onClick={() => setFilter(c)}
                >
                  {c}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,340px)_1fr] min-h-[480px]">
        <Card className="border-border-default bg-bg-card flex flex-col min-h-0">
          <CardContent className="p-0 flex flex-col flex-1 min-h-0">
            <div className="px-4 py-3 border-b border-border-default font-mono text-[0.62rem] uppercase tracking-wider text-text-muted">
              Threads ({filtered.length})
            </div>
            <ul className="overflow-y-auto flex-1 divide-y divide-border-default">
              {filtered.map((t) => {
                const active = selected?.id === t.id;
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(t.id)}
                      className={cn(
                        "w-full text-left px-4 py-3 transition-colors",
                        active
                          ? "bg-bg-card-hover border-l-2 border-l-syntax-builtin"
                          : "hover:bg-bg-card-hover/80 border-l-2 border-l-transparent"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            {t.unread && (
                              <span
                                className="size-2 shrink-0 rounded-full bg-syntax-builtin"
                                title="Unread"
                                aria-label="Unread"
                              />
                            )}
                            <span className="font-mono text-sm font-bold text-text-primary truncate">
                              {t.company}
                            </span>
                          </div>
                          <p className="text-xs text-text-secondary line-clamp-2 mt-1">
                            {t.preview}
                          </p>
                        </div>
                        <span className="font-mono text-[0.65rem] text-syntax-decorator shrink-0">
                          {t.time}
                        </span>
                      </div>
                      <div className="mt-2">
                        <Badge variant={listBadgeVariant(t.classification)}>
                          {t.classification}
                        </Badge>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border-default bg-bg-editor flex flex-col min-h-0">
          <CardContent className="flex flex-col gap-4 py-4 flex-1 min-h-0 overflow-y-auto">
            {selected ? (
              <>
                <div>
                  <h2 className="font-mono text-base font-bold text-text-primary">
                    {selected.company}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge variant={listBadgeVariant(selected.replyClassification)}>
                      {selected.replyClassification}
                    </Badge>
                    <span
                      className={cn(
                        "font-mono text-xs font-semibold",
                        sentimentLabel(selected.sentiment).className
                      )}
                    >
                      {sentimentLabel(selected.sentiment).text}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-2">
                    <span className="font-mono text-syntax-keyword">
                      suggested_next_action
                    </span>
                    <span className="text-text-muted"> — </span>
                    {selected.suggestedNextAction}
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="font-mono text-[0.62rem] uppercase tracking-wider text-text-muted">
                    Conversation
                  </h3>
                  {selected.messages.map((m) => (
                    <div
                      key={m.id}
                      className={cn(
                        "rounded-lg border px-3 py-2.5",
                        m.direction === "sent"
                          ? "border-border-default bg-bg-card ml-4"
                          : "border-border-active bg-bg-input mr-4"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span
                          className={cn(
                            "font-mono text-[0.65rem] font-semibold uppercase",
                            m.direction === "sent"
                              ? "text-syntax-builtin"
                              : "text-syntax-class"
                          )}
                        >
                          {m.direction}
                        </span>
                        <span className="font-mono text-[0.65rem] text-syntax-decorator">
                          {m.time}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary">{m.body}</p>
                    </div>
                  ))}
                </div>

                <ThreadDetail thread={selected} />
              </>
            ) : (
              <p className="text-sm text-text-muted">No thread selected.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
