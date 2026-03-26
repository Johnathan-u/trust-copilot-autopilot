"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/ui/kpi-card";
import { cn } from "@/lib/utils";

type EngStatus = "sent" | "opened" | "clicked" | "replied" | "bounced";

const ROWS: {
  recipient: string;
  company: string;
  subject: string;
  status: EngStatus;
  opens: number;
  clicks: number;
  replied: boolean;
  sent: string;
  lastEvent: string;
}[] = [
  {
    recipient: "alex.rivera@nimbussec.io",
    company: "Nimbus Security",
    subject: "SOC 2 readiness — scoped assessment",
    status: "opened",
    opens: 3,
    clicks: 0,
    replied: false,
    sent: "Mar 25, 9:14 AM",
    lastEvent: "Open · 2h ago",
  },
  {
    recipient: "procurement@cloudvault.com",
    company: "CloudVault",
    subject: "Vendor security packet summary",
    status: "replied",
    opens: 2,
    clicks: 1,
    replied: true,
    sent: "Mar 24, 4:02 PM",
    lastEvent: "Reply · 6h ago",
  },
  {
    recipient: "security@trustlayer.co",
    company: "TrustLayer",
    subject: "Evidence collection for renewals",
    status: "sent",
    opens: 0,
    clicks: 0,
    replied: false,
    sent: "Mar 25, 8:55 AM",
    lastEvent: "Delivered",
  },
  {
    recipient: "cto@irongate.io",
    company: "IronGate SaaS",
    subject: "Map controls to questionnaires",
    status: "clicked",
    opens: 1,
    clicks: 2,
    replied: false,
    sent: "Mar 25, 8:41 AM",
    lastEvent: "CTA click · 35m ago",
  },
  {
    recipient: "grc@polarishealth.org",
    company: "Polaris Health",
    subject: "HIPAA + SOC 2 overlap",
    status: "bounced",
    opens: 0,
    clicks: 0,
    replied: false,
    sent: "Mar 24, 11:18 AM",
    lastEvent: "Hard bounce",
  },
  {
    recipient: "dpo@vertexdata.ai",
    company: "Vertex Data",
    subject: "Trust room invite",
    status: "opened",
    opens: 1,
    clicks: 0,
    replied: false,
    sent: "Mar 23, 6:55 PM",
    lastEvent: "Room view · 1d ago",
  },
  {
    recipient: "vendor-risk@blueharbor.bank",
    company: "BlueHarbor Finance",
    subject: "FFIEC vendor checklist",
    status: "replied",
    opens: 4,
    clicks: 2,
    replied: true,
    sent: "Mar 22, 10:30 AM",
    lastEvent: "Reply · 2d ago",
  },
  {
    recipient: "it@latticeworks.dev",
    company: "LatticeWorks",
    subject: "Questionnaire automation pilot",
    status: "sent",
    opens: 0,
    clicks: 0,
    replied: false,
    sent: "Mar 25, 7:05 AM",
    lastEvent: "Queued send",
  },
  {
    recipient: "secops@quantmesh.io",
    company: "QuantMesh",
    subject: "Shared responsibility model one-pager",
    status: "clicked",
    opens: 2,
    clicks: 1,
    replied: false,
    sent: "Mar 24, 2:11 PM",
    lastEvent: "Link click · 18h ago",
  },
  {
    recipient: "privacy@northwind.travel",
    company: "Northwind Travel",
    subject: "Unsubscribe confirmation",
    status: "bounced",
    opens: 0,
    clicks: 0,
    replied: false,
    sent: "Mar 21, 9:00 AM",
    lastEvent: "Suppressed list",
  },
];

function statusCellClass(s: EngStatus) {
  switch (s) {
    case "replied":
      return "text-accent-green";
    case "opened":
      return "text-syntax-builtin";
    case "clicked":
      return "text-accent-yellow";
    case "bounced":
      return "text-accent-red";
    default:
      return "text-text-secondary";
  }
}

export default function EngagementTrackerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-mono text-lg font-bold text-text-primary">
          <span className="text-syntax-builtin">def</span> engagement_tracker
          <span className="text-text-muted">(</span>
          <span className="text-syntax-class">Analytics</span>
          <span className="text-text-muted">):</span>
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Opens, clicks, replies, and list health across outbound touches
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard label="Total sent" value="12,480" accent="blue" />
        <KpiCard label="Unique opens" value="5,142" sub="41.2% of sent" accent="teal" />
        <KpiCard label="Reply rate" value="8.7%" accent="green" />
        <KpiCard label="Bounce rate" value="1.1%" accent="red" />
        <KpiCard label="Unsubscribe rate" value="0.09%" accent="orange" />
      </div>

      <Card className="overflow-hidden border-border-default bg-bg-editor">
        <CardHeader className="py-3">
          <CardTitle>Engagement by recipient</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left border-collapse">
              <thead>
                <tr className="border-b border-border-default bg-bg-card font-mono text-[0.62rem] uppercase tracking-wider text-text-muted">
                  <th className="px-4 py-3 font-medium">Recipient</th>
                  <th className="px-4 py-3 font-medium">Company</th>
                  <th className="px-4 py-3 font-medium">Subject</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Opens</th>
                  <th className="px-4 py-3 font-medium text-right">Clicks</th>
                  <th className="px-4 py-3 font-medium">Reply?</th>
                  <th className="px-4 py-3 font-medium">Sent time</th>
                  <th className="px-4 py-3 font-medium">Last event</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-border-default last:border-0 hover:bg-bg-card-hover/60 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-syntax-string max-w-[200px] truncate">
                      {row.recipient}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-text-primary">
                      {row.company}
                    </td>
                    <td className="px-4 py-3 text-xs text-text-secondary max-w-[220px]">
                      {row.subject}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "font-mono text-xs font-semibold capitalize",
                          statusCellClass(row.status)
                        )}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs tabular-nums text-syntax-param">
                      {row.opens}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs tabular-nums text-syntax-keyword">
                      {row.clicks}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {row.replied ? (
                        <span className="text-accent-green">Yes</span>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-syntax-decorator whitespace-nowrap">
                      {row.sent}
                    </td>
                    <td className="px-4 py-3 text-xs text-text-secondary whitespace-nowrap">
                      {row.lastEvent}
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
