"use client";

import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { KpiCard } from "@/components/ui/kpi-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { EChartsWrapper } from "@/components/charts/echarts-wrapper";

const DAYS = Array.from({ length: 30 }, (_, i) => `D${i + 1}`);

const DOMAINS = [
  { domain: "go.trustcopilot.com", sent: 84200, del: 98.2, bounce: 0.9, spam: 0.04, rep: 94 },
  { domain: "app.trustcopilot.com", sent: 128400, del: 97.6, bounce: 1.4, spam: 0.07, rep: 91 },
  { domain: "cert.trustcopilot.com", sent: 18600, del: 99.1, bounce: 0.5, spam: 0.02, rep: 96 },
  { domain: "dev.trustcopilot.com", sent: 4200, del: 95.8, bounce: 2.8, spam: 0.15, rep: 78 },
];

const ISPS = [
  { name: "Gmail", rate: 97.4 },
  { name: "Outlook", rate: 96.1 },
  { name: "Yahoo", rate: 94.8 },
  { name: "Corporate", rate: 98.6 },
];

export default function DeliverabilityPage() {
  const areaOption = useMemo<EChartsOption>(() => {
    const delivered = DAYS.map((_, i) => 96.8 + Math.sin(i / 4) * 0.8 + (i % 5) * 0.05);
    const bounced = DAYS.map((_, i) => 1.2 + Math.cos(i / 3) * 0.35);
    const spam = DAYS.map((_, i) => 0.05 + (i % 7) * 0.012);
    return {
      color: ["#569cd6", "#ce9178", "#c586c0"],
      legend: { data: ["Delivered %", "Bounced %", "Spam %"], top: 0 },
      grid: { left: 44, right: 12, top: 32, bottom: 24 },
      xAxis: {
        type: "category",
        data: DAYS,
        axisLabel: { color: "#555570", fontSize: 9, interval: 4 },
      },
      yAxis: {
        type: "value",
        min: 0,
        max: 100,
        axisLabel: { color: "#555570", fontSize: 10, formatter: "{value}%" },
        splitLine: { lineStyle: { color: "#1e1e30" } },
      },
      tooltip: { trigger: "axis" },
      series: [
        {
          name: "Delivered %",
          type: "line",
          smooth: true,
          areaStyle: { color: "rgba(86, 156, 214, 0.15)" },
          data: delivered,
        },
        {
          name: "Bounced %",
          type: "line",
          smooth: true,
          areaStyle: { color: "rgba(206, 145, 120, 0.12)" },
          data: bounced,
        },
        {
          name: "Spam %",
          type: "line",
          smooth: true,
          areaStyle: { color: "rgba(197, 134, 192, 0.12)" },
          data: spam,
        },
      ],
    };
  }, []);

  return (
    <div className="space-y-6 bg-bg-root min-h-full">
      <div>
        <h1 className="font-mono text-lg font-bold text-text-primary">
          <span className="text-syntax-builtin">def</span> deliverability
          <span className="text-text-muted">(</span>
          <span className="text-syntax-class">Dashboard</span>
          <span className="text-text-muted">):</span>
        </h1>
        <p className="text-xs text-text-muted mt-1 font-mono">
          Sending domains, mailbox providers, and reputation in one view.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Delivery Rate" value="97.4%" sub="30d aggregate" accent="green" />
        <KpiCard label="Bounce Rate" value="1.18%" sub="hard + soft" accent="orange" />
        <KpiCard label="Spam Rate" value="0.06%" sub="FBL + postmaster" accent="red" />
        <KpiCard label="Domain Reputation" value="92" sub="0–100 composite" accent="blue" />
      </div>

      <Card className="border-border-default bg-bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-mono text-sm text-text-primary">Delivery metrics (30 days)</CardTitle>
        </CardHeader>
        <CardContent>
          <EChartsWrapper option={areaOption} height={300} />
        </CardContent>
      </Card>

      <Card className="border-border-default bg-bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-mono text-sm text-text-primary">Domain breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full font-mono text-xs">
              <thead>
                <tr className="border-b border-border-default bg-bg-editor text-left text-text-muted uppercase tracking-wider">
                  <th className="px-4 py-2 font-medium">Domain</th>
                  <th className="px-4 py-2 font-medium">Sent</th>
                  <th className="px-4 py-2 font-medium">Delivered</th>
                  <th className="px-4 py-2 font-medium">Bounced</th>
                  <th className="px-4 py-2 font-medium">Spam</th>
                  <th className="px-4 py-2 font-medium">Reputation</th>
                </tr>
              </thead>
              <tbody className="text-text-secondary">
                {DOMAINS.map((d) => (
                  <tr key={d.domain} className="border-b border-border-default hover:bg-bg-card-hover/50">
                    <td className="px-4 py-2.5 text-syntax-string">{d.domain}</td>
                    <td className="px-4 py-2.5 text-text-primary">{d.sent.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-accent-green">{d.del}%</td>
                    <td className="px-4 py-2.5 text-accent-yellow">{d.bounce}%</td>
                    <td className="px-4 py-2.5 text-accent-red">{d.spam}%</td>
                    <td className="px-4 py-2.5 text-syntax-param">{d.rep}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border-default bg-bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-mono text-sm text-text-primary">ISP delivery rate</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {ISPS.map((isp) => (
            <div key={isp.name}>
              <div className="mb-1 flex justify-between font-mono text-xs text-text-secondary">
                <span className="text-text-primary">{isp.name}</span>
                <span className="text-syntax-class">{isp.rate}%</span>
              </div>
              <ProgressBar value={isp.rate} max={100} color="#4ec9b0" showLabel />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
