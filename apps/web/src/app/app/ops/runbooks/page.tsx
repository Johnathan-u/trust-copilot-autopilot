"use client";

import { useState, type ComponentProps } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Severity = "p0" | "p1" | "p2";

interface Runbook {
  id: string;
  title: string;
  severity: Severity;
  lastUpdated: string;
  lastExecuted: string;
  estimated: string;
  stepCount: number;
  steps: { title: string; detail: string; minutes: string; notes?: string }[];
}

const RUNBOOKS: Runbook[] = [
  {
    id: "rb-bounce",
    title: "High Bounce Rate Response",
    severity: "p1",
    lastUpdated: "2025-03-20",
    lastExecuted: "2025-03-23",
    estimated: "25 min",
    stepCount: 8,
    steps: [
      { title: "Confirm scope", detail: "Identify domains and cohorts with bounce spike vs baseline.", minutes: "3m" },
      { title: "Check DNS / DKIM", detail: "Validate SPF alignment, DKIM selectors, and recent DNS TTL changes.", minutes: "5m" },
      { title: "Review suppression", detail: "Export hard-bounce sample; verify typo domains vs policy blocks.", minutes: "4m" },
      { title: "Throttle lane", detail: "Reduce warmup concurrency for affected domain until health recovers.", minutes: "5m" },
      { title: "Postmortem note", detail: "File incident summary with root cause hypothesis and owner.", minutes: "8m", notes: "Link to deliverability dashboard." },
    ],
  },
  {
    id: "rb-complaint",
    title: "Complaint Spike Handling",
    severity: "p0",
    lastUpdated: "2025-03-18",
    lastExecuted: "2025-02-14",
    estimated: "35 min",
    stepCount: 9,
    steps: [
      { title: "Pause affected streams", detail: "Stop sequences touching the complaining cohort.", minutes: "5m" },
      { title: "Pull FBL samples", detail: "Correlate mailbox provider, template id, and send window.", minutes: "8m" },
      { title: "Legal / brand review", detail: "Escalate if complaint ratio exceeds policy threshold.", minutes: "10m" },
      { title: "Rotate creative", detail: "Swap to minimal plain-text variant for re-engagement.", minutes: "7m" },
      { title: "Verify reputation", detail: "Re-check domain scores before resuming volume.", minutes: "5m" },
    ],
  },
  {
    id: "rb-warmup",
    title: "Domain Warmup Recovery",
    severity: "p2",
    lastUpdated: "2025-03-10",
    lastExecuted: "2025-03-12",
    estimated: "40 min",
    stepCount: 7,
    steps: [
      { title: "Baseline metrics", detail: "Snapshot delivery, bounce, and deferral curves for 14d.", minutes: "5m" },
      { title: "Reduce daily cap", detail: "Cut sends by 40% for 48h unless P0 revenue risk.", minutes: "5m" },
      { title: "Segment cold mailboxes", detail: "Isolate Yahoo / Outlook if deferrals cluster.", minutes: "8m" },
      { title: "Content hygiene", detail: "Remove tracking-heavy modules; test inbox placement.", minutes: "12m" },
      { title: "Gradual ramp", detail: "Apply +10% cap daily after two clean windows.", minutes: "10m" },
    ],
  },
  {
    id: "rb-kill",
    title: "Kill Switch Activation",
    severity: "p0",
    lastUpdated: "2025-03-01",
    lastExecuted: "2025-01-09",
    estimated: "15 min",
    stepCount: 6,
    steps: [
      { title: "Announce incident", detail: "Page on-call + post to #incidents with customer impact.", minutes: "2m" },
      { title: "Arm outbound kill", detail: "Use ops console — capture mandatory reason string.", minutes: "3m" },
      { title: "Arm scoring kill", detail: "Disable ranking writes; serve last-known-good scores.", minutes: "3m" },
      { title: "Verify drain", detail: "Confirm queue depth trending to zero without DLQ growth.", minutes: "4m" },
      { title: "Customer comms", detail: "Notify CS lead if SLA-impacting; draft holding statement.", minutes: "3m" },
    ],
  },
  {
    id: "rb-pipeline",
    title: "Data Pipeline Failure",
    severity: "p1",
    lastUpdated: "2025-03-15",
    lastExecuted: "2025-03-19",
    estimated: "50 min",
    stepCount: 11,
    steps: [
      { title: "Identify failing stage", detail: "Check Airflow / worker logs for first red task.", minutes: "6m" },
      { title: "Checkpoint offsets", detail: "Record Kafka / bookmark positions before replay.", minutes: "8m" },
      { title: "Replay from safe watermark", detail: "Use idempotent job id; monitor duplicate keys.", minutes: "15m" },
      { title: "Validate row counts", detail: "Compare fact tables vs source API totals.", minutes: "10m" },
      { title: "Clear backlog SLA", detail: "Document ETA for downstream enrichment consumers.", minutes: "11m" },
    ],
  },
  {
    id: "rb-drift",
    title: "Model Drift Detection",
    severity: "p2",
    lastUpdated: "2025-03-22",
    lastExecuted: "2025-03-21",
    estimated: "30 min",
    stepCount: 8,
    steps: [
      { title: "Open eval dashboard", detail: "Compare precision/recall vs prior 7d rolling window.", minutes: "4m" },
      { title: "Slice by segment", detail: "Check SMB vs ENT; flag cohorts with >2σ drop.", minutes: "6m" },
      { title: "Feature coverage", detail: "Verify missing enrichment fields spiked with deploy.", minutes: "8m" },
      { title: "Shadow traffic", detail: "If shadow model healthier, prep promotion checklist.", minutes: "7m" },
      { title: "Rollback decision", detail: "Either revert weights or freeze auto-promotion.", minutes: "5m" },
    ],
  },
];

function sevVariant(s: Severity): ComponentProps<typeof Badge>["variant"] {
  if (s === "p0") return "p0";
  if (s === "p1") return "p1";
  return "default";
}

export default function RunbooksPage() {
  const [selectedId, setSelectedId] = useState<string | null>(RUNBOOKS[0]?.id ?? null);
  const selected = RUNBOOKS.find((r) => r.id === selectedId) ?? null;

  return (
    <div className="space-y-6 bg-bg-root min-h-full">
      <div>
        <h1 className="font-mono text-lg font-bold text-text-primary">
          <span className="text-syntax-builtin">def</span> runbooks
          <span className="text-text-muted">(</span>
          <span className="text-syntax-class">Library</span>
          <span className="text-text-muted">):</span>
        </h1>
        <p className="text-xs text-text-muted mt-1 font-mono">
          Operational procedures and on-call checklists.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {RUNBOOKS.map((rb) => {
          const active = rb.id === selectedId;
          return (
            <button
              key={rb.id}
              type="button"
              onClick={() => setSelectedId(rb.id)}
              className={cn(
                "rounded-xl border text-left transition-colors",
                "border-border-default bg-bg-card p-4 hover:bg-bg-card-hover",
                active && "ring-1 ring-syntax-builtin/40 bg-bg-editor"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-mono text-sm font-semibold text-text-primary leading-snug">{rb.title}</h2>
                <Badge variant={sevVariant(rb.severity)}>{rb.severity}</Badge>
              </div>
              <dl className="mt-3 space-y-1 font-mono text-[0.65rem] text-text-muted">
                <div className="flex justify-between gap-2">
                  <dt>Updated</dt>
                  <dd className="text-text-secondary">{rb.lastUpdated}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Last run</dt>
                  <dd className="text-text-secondary">{rb.lastExecuted}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Est.</dt>
                  <dd className="text-syntax-class">{rb.estimated}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Steps</dt>
                  <dd className="text-text-secondary">{rb.stepCount}</dd>
                </div>
              </dl>
            </button>
          );
        })}
      </div>

      {selected && (
        <Card className="border-border-default bg-bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-mono text-sm text-text-primary">
              Checklist — <span className="text-syntax-string">{selected.title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-0">
            <ol className="relative border-l border-border-default ml-3 pl-6 space-y-6 pb-2">
              {selected.steps.map((step, idx) => (
                <li key={step.title} className="relative">
                  <span className="absolute -left-[1.4rem] top-0 flex size-6 items-center justify-center rounded border border-border-default bg-bg-input">
                    <span className="font-mono text-[0.6rem] text-text-muted">{idx + 1}</span>
                  </span>
                  <div className="flex items-start gap-3">
                    <div
                      className="mt-0.5 size-4 shrink-0 rounded border border-syntax-class/50 bg-bg-editor"
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-mono text-xs font-semibold text-text-primary">{step.title}</div>
                      <p className="mt-1 text-xs text-text-secondary leading-relaxed">{step.detail}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-[0.65rem] text-text-muted">
                        <span className="text-syntax-param">{step.minutes}</span>
                        {step.notes && (
                          <span className="rounded border border-border-default bg-bg-input px-2 py-0.5 text-syntax-decorator">
                            {step.notes}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
