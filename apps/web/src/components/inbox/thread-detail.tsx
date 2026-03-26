"use client";

import { useState, type ComponentProps } from "react";
import {
  ArrowRight,
  Ban,
  CheckCircle,
  Clock,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type MockReplyEvent = {
  id: string;
  ts: string;
  direction: "sent" | "received";
  classification: string;
  confidence: number;
};

export type MockThread = {
  id: string;
  company: string;
  preview: string;
  classification: string;
  time: string;
  unread: boolean;
  messages: { id: string; direction: "sent" | "received"; body: string; time: string }[];
  replyClassification: string;
  sentiment: "positive" | "neutral" | "negative";
  suggestedNextAction: string;
  replyEvents: MockReplyEvent[];
};

const SNOOZE_OPTIONS = ["1d", "3d", "7d", "30d"] as const;

function classificationBadgeVariant(
  c: string
): ComponentProps<typeof Badge>["variant"] {
  const lower = c.toLowerCase();
  if (
    lower.includes("interested") ||
    lower.includes("meeting") ||
    lower.includes("referral")
  ) {
    return "success";
  }
  if (
    lower.includes("not now") ||
    lower.includes("snooze") ||
    lower.includes("follow")
  ) {
    return "warning";
  }
  if (
    lower.includes("unsub") ||
    lower.includes("bounce") ||
    lower.includes("dead") ||
    lower.includes("suppress")
  ) {
    return "p0";
  }
  if (lower.includes("no reply")) {
    return "info";
  }
  return "default";
}

export function ThreadDetail({ thread }: { thread: MockThread }) {
  const [snooze, setSnooze] = useState<(typeof SNOOZE_OPTIONS)[number]>("3d");

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="font-mono text-[0.62rem] uppercase tracking-wider text-text-muted mb-3">
          Reply classification timeline
        </h3>
        <div className="relative pl-4">
          <div
            className="absolute left-[7px] top-2 bottom-2 w-px bg-border-default"
            aria-hidden
          />
          <ul className="space-y-4">
            {thread.replyEvents.map((ev) => (
              <li key={ev.id} className="relative flex gap-3">
                <span
                  className={cn(
                    "absolute left-0 top-1.5 size-2 rounded-full border-2 border-bg-editor z-[1]",
                    ev.direction === "sent"
                      ? "bg-syntax-builtin"
                      : "bg-syntax-class"
                  )}
                  aria-hidden
                />
                <Card className="flex-1 border-border-default bg-bg-card">
                  <CardContent className="py-3 px-3 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[0.65rem] text-syntax-decorator">
                        {ev.ts}
                      </span>
                      <Badge
                        variant={
                          ev.direction === "sent" ? "discovery" : "qualification"
                        }
                      >
                        {ev.direction}
                      </Badge>
                      <Badge variant={classificationBadgeVariant(ev.classification)}>
                        {ev.classification}
                      </Badge>
                    </div>
                    <p className="font-mono text-xs text-text-secondary">
                      <span className="text-syntax-keyword">confidence</span>
                      <span className="text-text-muted"> = </span>
                      <span className="tabular-nums text-syntax-param">
                        {ev.confidence}%
                      </span>
                    </p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-border-default bg-bg-editor p-4 space-y-3">
        <div className="font-mono text-[0.62rem] uppercase tracking-wider text-text-muted">
          Snooze
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SNOOZE_OPTIONS.map((d) => (
            <Button
              key={d}
              type="button"
              size="sm"
              variant={snooze === d ? "default" : "outline"}
              onClick={() => setSnooze(d)}
              className="min-w-[2.75rem]"
            >
              {d}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 pt-1 border-t border-border-default">
          <Button type="button" size="sm" variant="outline">
            <Clock />
            Snooze {snooze}
          </Button>
          <Button type="button" size="sm" variant="outline">
            <ArrowRight />
            Follow up
          </Button>
          <Button type="button" size="sm" variant="outline">
            <Users />
            Refer
          </Button>
          <Button type="button" size="sm" variant="destructive">
            <Ban />
            Suppress
          </Button>
          <Button type="button" size="sm" variant="success">
            <CheckCircle />
            Mark resolved
          </Button>
        </div>
      </div>
    </div>
  );
}
