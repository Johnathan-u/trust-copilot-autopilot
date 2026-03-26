"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KpiCard } from "@/components/ui/kpi-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";

const DOMAIN_ROWS = [
  {
    domain: "outreach.trustcopilot.io",
    dailyLimit: 800,
    sent: 412,
    warmupStage: "Stage 3 — Ramp",
    autoPausePct: 4.5,
  },
  {
    domain: "mail.sequences.acme.com",
    dailyLimit: 600,
    sent: 589,
    warmupStage: "Stage 4 — Steady",
    autoPausePct: 3.0,
  },
  {
    domain: "seq.notify.company.co",
    dailyLimit: 500,
    sent: 120,
    warmupStage: "Stage 2 — Warm",
    autoPausePct: 5.0,
  },
  {
    domain: "replies.gtm.smtp.internal",
    dailyLimit: 400,
    sent: 0,
    warmupStage: "Stage 1 — Seed",
    autoPausePct: 2.5,
  },
] as const;

export default function OutreachBudgetsPage() {
  const [killSwitchTripped, setKillSwitchTripped] = useState(false);
  const [msgsPerMin, setMsgsPerMin] = useState("45");
  const [msgsPerHour, setMsgsPerHour] = useState("1800");
  const [bounceThreshold, setBounceThreshold] = useState("3.5");

  const dailySendLimit = DOMAIN_ROWS.reduce((s, r) => s + r.dailyLimit, 0);
  const sentToday = DOMAIN_ROWS.reduce((s, r) => s + r.sent, 0);
  const remaining = Math.max(0, dailySendLimit - sentToday);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-mono text-lg font-bold text-text-primary">
          <span className="text-syntax-builtin">def</span> outreach_budgets
          <span className="text-text-muted">(</span>
          <span className="text-syntax-class">Controls</span>
          <span className="text-text-muted">):</span>
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Domain caps, send pacing, and emergency stops for outreach volume
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Daily send limit" value={dailySendLimit} accent="blue" />
        <KpiCard label="Sent today" value={sentToday} accent="teal" />
        <KpiCard label="Remaining" value={remaining} accent="purple" />
        <KpiCard
          label="Kill switch"
          value={killSwitchTripped ? "Tripped" : "Armed"}
          accent={killSwitchTripped ? "red" : "green"}
          sub={killSwitchTripped ? "Outbound halted" : "Safety engaged"}
        />
      </div>

      <Card className="bg-bg-card border-border-default">
        <CardHeader>
          <CardTitle className="text-syntax-param">
            <span className="text-syntax-keyword">class</span>{" "}
            <span className="text-syntax-class">PerDomainBudget</span>
            <span className="text-text-muted">:</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-border-default bg-bg-editor text-text-muted uppercase tracking-wider">
                  <th className="px-5 py-2.5 font-semibold">Domain</th>
                  <th className="px-5 py-2.5 font-semibold">Daily limit</th>
                  <th className="px-5 py-2.5 font-semibold">Sent</th>
                  <th className="px-5 py-2.5 font-semibold">Remaining</th>
                  <th className="min-w-[140px] px-5 py-2.5 font-semibold">Usage</th>
                  <th className="px-5 py-2.5 font-semibold">Warmup stage</th>
                  <th className="px-5 py-2.5 font-semibold">Auto-pause @ bounce</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default text-text-secondary">
                {DOMAIN_ROWS.map((row) => {
                  const rem = Math.max(0, row.dailyLimit - row.sent);
                  return (
                    <tr key={row.domain} className="bg-bg-card hover:bg-bg-card-hover transition-colors">
                      <td className="px-5 py-3 text-syntax-string">{row.domain}</td>
                      <td className="px-5 py-3 text-text-primary">{row.dailyLimit}</td>
                      <td className="px-5 py-3 text-syntax-builtin">{row.sent}</td>
                      <td className="px-5 py-3 text-accent-green">{rem}</td>
                      <td className="px-5 py-3">
                        <ProgressBar value={row.sent} max={row.dailyLimit} showLabel />
                      </td>
                      <td className="px-5 py-3 text-text-primary">{row.warmupStage}</td>
                      <td className="px-5 py-3">
                        <span className="text-syntax-decorator">&gt;</span>{" "}
                        <span className="text-accent-yellow">{row.autoPausePct}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="font-mono text-sm font-semibold text-syntax-function mb-3">
          safety_controls<span className="text-text-muted">()</span>
        </h2>
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="bg-bg-card border-border-default">
            <CardHeader className="flex-row items-start justify-between gap-3">
              <div>
                <CardTitle>Kill switch</CardTitle>
                <p className="text-xs text-text-muted mt-1 font-mono">
                  Halt all outreach sends immediately
                </p>
              </div>
              <Badge variant={killSwitchTripped ? "p0" : "success"}>
                {killSwitchTripped ? "Tripped" : "Armed"}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-xs text-text-secondary">State</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={killSwitchTripped}
                  onClick={() => setKillSwitchTripped((v) => !v)}
                  className={cn(
                    "relative h-8 w-14 shrink-0 rounded-full border border-border-default transition-colors",
                    killSwitchTripped ? "bg-accent-red/20" : "bg-accent-green-dim"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-1 h-6 w-6 rounded-full bg-bg-editor border border-border-default shadow transition-transform",
                      killSwitchTripped ? "translate-x-7" : "translate-x-1"
                    )}
                  />
                </button>
              </div>
              <p className="text-xs text-text-muted font-mono">
                <span className="text-syntax-keyword">if</span> tripped:{" "}
                <span className="text-syntax-string">&quot;queue_drained&quot;</span>
              </p>
            </CardContent>
          </Card>

          <Card className="bg-bg-card border-border-default">
            <CardHeader className="flex-row items-start justify-between gap-3">
              <div>
                <CardTitle>Rate limiter</CardTitle>
                <p className="text-xs text-text-muted mt-1 font-mono">
                  Hard caps on dispatch velocity
                </p>
              </div>
              <Badge variant="success">Armed</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="font-mono text-[0.62rem] uppercase tracking-wider text-text-muted">
                  msgs / min
                </label>
                <Input
                  value={msgsPerMin}
                  onChange={(e) => setMsgsPerMin(e.target.value)}
                  className="mt-1 bg-bg-input"
                />
              </div>
              <div>
                <label className="font-mono text-[0.62rem] uppercase tracking-wider text-text-muted">
                  msgs / hour
                </label>
                <Input
                  value={msgsPerHour}
                  onChange={(e) => setMsgsPerHour(e.target.value)}
                  className="mt-1 bg-bg-input"
                />
              </div>
              <Button variant="outline" size="sm" className="w-full">
                Apply limiter
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-bg-card border-border-default">
            <CardHeader className="flex-row items-start justify-between gap-3">
              <div>
                <CardTitle>Bounce threshold</CardTitle>
                <p className="text-xs text-text-muted mt-1 font-mono">
                  Auto-pause domain if bounce rate exceeds cap
                </p>
              </div>
              <Badge variant="p1">Warning</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="font-mono text-[0.62rem] uppercase tracking-wider text-text-muted">
                  Pause if bounce &gt; (%)
                </label>
                <Input
                  value={bounceThreshold}
                  onChange={(e) => setBounceThreshold(e.target.value)}
                  className="mt-1 bg-bg-input"
                />
              </div>
              <p className="text-xs text-text-secondary">
                <span className="text-accent-yellow font-mono">2 domains</span> within{" "}
                <span className="font-mono text-syntax-param">0.6%</span> of threshold
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Save threshold
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
