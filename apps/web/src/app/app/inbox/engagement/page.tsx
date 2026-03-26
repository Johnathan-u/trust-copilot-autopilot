"use client";

import type { ComponentProps } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/ui/kpi-card";
import { cn } from "@/lib/utils";

const FUNNEL = [
  { label: "Email sent", count: 1000, bar: "bg-syntax-builtin" },
  { label: "Opened", count: 420, bar: "bg-syntax-class" },
  { label: "CTA clicked", count: 89, bar: "bg-syntax-keyword" },
  { label: "Proof viewed", count: 62, bar: "bg-syntax-string" },
  { label: "Offer viewed", count: 34, bar: "bg-syntax-decorator" },
  { label: "Checkout", count: 12, bar: "bg-syntax-function" },
  { label: "Paid", count: 8, bar: "bg-accent-green" },
] as const;

type CtaType = "proof" | "offer" | "calendar";

const CTA_EVENTS: {
  account: string;
  ctaType: CtaType;
  clicked: string;
  time: string;
  destination: string;
  converted: boolean;
}[] = [
  {
    account: "Nimbus Security",
    ctaType: "proof",
    clicked: "Proof pack — SOC 2",
    time: "Mar 25, 10:04 AM",
    destination: "/trust/proof/soc2-redacted",
    converted: true,
  },
  {
    account: "CloudVault",
    ctaType: "offer",
    clicked: "Pilot pricing sheet",
    time: "Mar 25, 9:52 AM",
    destination: "/offers/pilot-2025q1",
    converted: false,
  },
  {
    account: "BlueHarbor Finance",
    ctaType: "calendar",
    clicked: "Book security review",
    time: "Mar 25, 9:18 AM",
    destination: "/calendar/ffiec-slot",
    converted: true,
  },
  {
    account: "IronGate SaaS",
    ctaType: "proof",
    clicked: "Control mapping sample",
    time: "Mar 25, 8:44 AM",
    destination: "/trust/proof/controls",
    converted: false,
  },
  {
    account: "Vertex Data",
    ctaType: "offer",
    clicked: "Trust room upgrade",
    time: "Mar 24, 6:12 PM",
    destination: "/offers/trust-room-plus",
    converted: false,
  },
  {
    account: "QuantMesh",
    ctaType: "proof",
    clicked: "Shared responsibility PDF",
    time: "Mar 24, 2:22 PM",
    destination: "/trust/proof/srm",
    converted: true,
  },
  {
    account: "LatticeWorks",
    ctaType: "calendar",
    clicked: "Automation demo",
    time: "Mar 24, 11:05 AM",
    destination: "/calendar/demo-30",
    converted: false,
  },
  {
    account: "HelioFin",
    ctaType: "offer",
    clicked: "Security addendum",
    time: "Mar 24, 9:30 AM",
    destination: "/offers/dpa-addendum",
    converted: true,
  },
];

function ctaBadge(t: CtaType): ComponentProps<typeof Badge>["variant"] {
  switch (t) {
    case "proof":
      return "discovery";
    case "offer":
      return "qualification";
    case "calendar":
      return "contact";
    default:
      return "default";
  }
}

export default function CtaMonitorPage() {
  const maxCount = FUNNEL[0].count;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-mono text-lg font-bold text-text-primary">
          <span className="text-syntax-builtin">def</span> cta_monitor
          <span className="text-text-muted">(</span>
          <span className="text-syntax-class">Analytics</span>
          <span className="text-text-muted">):</span>
        </h1>
        <p className="text-xs text-text-muted mt-1">
          CTA clicks through proof, offer, and calendar destinations
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total CTAs sent" value="2,840" sub="rolling 14d" accent="blue" />
        <KpiCard label="Click rate" value="8.9%" sub="of delivered" accent="teal" />
        <KpiCard label="Proof pack views" value={612} accent="purple" />
        <KpiCard label="Offer page views" value={334} accent="green" />
      </div>

      <Card className="border-border-default bg-bg-card overflow-hidden">
        <CardHeader className="py-3">
          <CardTitle className="font-mono text-sm text-syntax-function">
            Conversion funnel
          </CardTitle>
          <p className="text-xs text-text-muted font-mono">
            Stacked drop-off from email send → revenue
          </p>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="mx-auto max-w-md flex flex-col items-stretch gap-3">
            {FUNNEL.map((step, i) => {
              const prev = i === 0 ? step.count : FUNNEL[i - 1].count;
              const rateFromPrev =
                prev > 0 ? ((step.count / prev) * 100).toFixed(1) : "—";
              const widthPct = Math.max(
                8,
                Math.round((step.count / maxCount) * 100)
              );
              return (
                <div key={step.label} className="flex flex-col gap-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-mono text-xs font-semibold text-text-primary">
                      {step.label}
                    </span>
                    <span className="font-mono text-xs tabular-nums text-syntax-param">
                      {step.count.toLocaleString()}
                    </span>
                  </div>
                  <div
                    className={cn(
                      "h-9 rounded-md flex items-center justify-end pr-3 transition-all border border-border-default/40",
                      step.bar,
                      "min-w-[2rem]"
                    )}
                    style={{ width: `${widthPct}%` }}
                  >
                    <span className="font-mono text-[0.65rem] font-bold text-bg-root drop-shadow-sm">
                      {i === 0 ? "100%" : `${rateFromPrev}%`}
                    </span>
                  </div>
                  <span className="font-mono text-[0.6rem] text-text-muted">
                    {i === 0
                      ? "Baseline — 100% of sent cohort"
                      : `Conversion from previous step`}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border-default bg-bg-editor">
        <CardHeader className="py-3">
          <CardTitle className="font-mono text-sm">Recent CTA events</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left border-collapse">
              <thead>
                <tr className="border-b border-border-default bg-bg-card font-mono text-[0.62rem] uppercase tracking-wider text-text-muted">
                  <th className="px-4 py-3 font-medium">Account</th>
                  <th className="px-4 py-3 font-medium">CTA type</th>
                  <th className="px-4 py-3 font-medium">Clicked</th>
                  <th className="px-4 py-3 font-medium">Time</th>
                  <th className="px-4 py-3 font-medium">Destination</th>
                  <th className="px-4 py-3 font-medium">Converted?</th>
                </tr>
              </thead>
              <tbody>
                {CTA_EVENTS.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-border-default last:border-0 hover:bg-bg-card-hover/60 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-text-primary">
                      {row.account}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={ctaBadge(row.ctaType)}>{row.ctaType}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-secondary max-w-[200px]">
                      {row.clicked}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-syntax-decorator whitespace-nowrap">
                      {row.time}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-syntax-string max-w-[240px] truncate">
                      {row.destination}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {row.converted ? (
                        <span className="text-accent-green">Yes</span>
                      ) : (
                        <span className="text-text-muted">No</span>
                      )}
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
