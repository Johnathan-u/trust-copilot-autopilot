"use client";

import { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ValueKind = "string" | "number" | "boolean";

type FeatureRow = {
  name: string;
  kind: ValueKind;
  value: string | number | boolean;
  provenance: string;
  updatedAt: Date;
};

type FeatureCategory = {
  title: string;
  features: FeatureRow[];
};

function formatRelativeTime(d: Date, now: Date): string {
  const diffMs = now.getTime() - d.getTime();
  const sec = Math.floor(diffMs / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  if (day > 30) return `${Math.floor(day / 30)}mo ago`;
  if (day > 0) return `${day}d ago`;
  if (hr > 0) return `${hr}h ago`;
  if (min > 0) return `${min}m ago`;
  return "just now";
}

function FeatureValueCell({ row }: { row: FeatureRow }) {
  if (row.kind === "boolean") {
    return (
      <span
        className={cn(
          "font-mono text-xs font-medium tabular-nums",
          row.value ? "text-accent-green" : "text-accent-red"
        )}
      >
        {row.value ? "true" : "false"}
      </span>
    );
  }
  if (row.kind === "number") {
    const n = row.value as number;
    const text = Number.isInteger(n) ? n.toLocaleString("en-US") : n.toFixed(2);
    return (
      <span className="font-mono text-xs tabular-nums text-syntax-number">{text}</span>
    );
  }
  return <span className="font-mono text-xs text-syntax-string break-words">{row.value as string}</span>;
}

function buildMockCategories(now: Date): FeatureCategory[] {
  const t = (ms: number) => new Date(now.getTime() - ms);
  return [
    {
      title: "Firmographics",
      features: [
        {
          name: "company.canonical_domain",
          kind: "string",
          value: "acme.io",
          provenance: "Clearbit enrichment",
          updatedAt: t(2 * 24 * 60 * 60 * 1000),
        },
        {
          name: "company.employee_band",
          kind: "string",
          value: "201–500",
          provenance: "LinkedIn headcount + careers crawl",
          updatedAt: t(5 * 60 * 60 * 1000),
        },
        {
          name: "company.industry",
          kind: "string",
          value: "B2B SaaS — collaboration",
          provenance: "Crunchbase + site classifier",
          updatedAt: t(18 * 60 * 60 * 1000),
        },
        {
          name: "company.hq_region",
          kind: "string",
          value: "US — West",
          provenance: "WHOIS + careers location",
          updatedAt: t(3 * 24 * 60 * 60 * 1000),
        },
        {
          name: "company.arr_estimate_usd",
          kind: "number",
          value: 42_000_000,
          provenance: "Modeled from hiring + traffic",
          updatedAt: t(26 * 60 * 60 * 1000),
        },
        {
          name: "company.funding_stage",
          kind: "string",
          value: "Series C",
          provenance: "Press + PitchBook snapshot",
          updatedAt: t(9 * 24 * 60 * 60 * 1000),
        },
      ],
    },
    {
      title: "Pain indicators",
      features: [
        {
          name: "security.soc2_signal_strength",
          kind: "number",
          value: 0.87,
          provenance: "Trust center + job reqs + blog",
          updatedAt: t(45 * 60 * 1000),
        },
        {
          name: "security.open_security_roles",
          kind: "number",
          value: 4,
          provenance: "Greenhouse API mirror",
          updatedAt: t(3 * 60 * 60 * 1000),
        },
        {
          name: "security.iso27001_mentioned",
          kind: "boolean",
          value: true,
          provenance: "Site copy + PDF policy pack",
          updatedAt: t(12 * 60 * 60 * 1000),
        },
        {
          name: "security.customer_dpa_present",
          kind: "boolean",
          value: true,
          provenance: "trust.acme.io/legal crawl",
          updatedAt: t(1 * 24 * 60 * 60 * 1000),
        },
        {
          name: "security.incident_history_90d",
          kind: "number",
          value: 1,
          provenance: "status page RSS",
          updatedAt: t(4 * 24 * 60 * 60 * 1000),
        },
        {
          name: "compliance.audit_window_quarter",
          kind: "string",
          value: "Q2 2026",
          provenance: "Inferred from hiring + vendor RFP leak",
          updatedAt: t(6 * 60 * 60 * 1000),
        },
      ],
    },
    {
      title: "Scoring",
      features: [
        {
          name: "icp.fit_score",
          kind: "number",
          value: 0.82,
          provenance: "Weighted blend (firmo + pain)",
          updatedAt: t(20 * 60 * 1000),
        },
        {
          name: "icp.timing_urgency",
          kind: "number",
          value: 0.74,
          provenance: "SOC2 + hiring velocity",
          updatedAt: t(20 * 60 * 1000),
        },
        {
          name: "value.estimated_seat_count",
          kind: "number",
          value: 380,
          provenance: "SSO IdP metadata + SCIM hints",
          updatedAt: t(2 * 24 * 60 * 60 * 1000),
        },
        {
          name: "value.likely_acv_band_usd",
          kind: "string",
          value: "85k–140k",
          provenance: "Peer cohort + seat model",
          updatedAt: t(2 * 24 * 60 * 60 * 1000),
        },
        {
          name: "risk.data_residency_friction",
          kind: "boolean",
          value: false,
          provenance: "Subprocessor list + regions",
          updatedAt: t(7 * 24 * 60 * 60 * 1000),
        },
      ],
    },
    {
      title: "Contact readiness",
      features: [
        {
          name: "contact.security_owner_identified",
          kind: "boolean",
          value: true,
          provenance: "LinkedIn + press bylines",
          updatedAt: t(50 * 60 * 1000),
        },
        {
          name: "contact.primary_persona",
          kind: "string",
          value: "Head of Security / GRC",
          provenance: "Role graph from signals",
          updatedAt: t(50 * 60 * 1000),
        },
        {
          name: "contact.email_pattern_confidence",
          kind: "number",
          value: 0.91,
          provenance: "MX + scraped signatures",
          updatedAt: t(8 * 60 * 60 * 1000),
        },
        {
          name: "contact.do_not_contact_flag",
          kind: "boolean",
          value: false,
          provenance: "CRM suppression list (mock)",
          updatedAt: t(14 * 24 * 60 * 60 * 1000),
        },
      ],
    },
  ];
}

export function FeatureInspector() {
  const now = useMemo(() => new Date(), []);
  const categories = useMemo(() => buildMockCategories(now), [now]);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-text-muted">
        Normalized feature snapshot for a mid-market B2B SaaS account actively pursuing SOC 2 — used for ICP, pain,
        and value routing.
      </p>
      {categories.map((cat) => (
        <Card key={cat.title} className="border-border-default bg-bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-text-primary">{cat.title}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-border-default bg-bg-input/50 font-mono text-[0.65rem] uppercase tracking-wider text-text-muted">
                    <th className="px-4 py-2.5 font-semibold">Feature</th>
                    <th className="px-4 py-2.5 font-semibold">Value</th>
                    <th className="px-4 py-2.5 font-semibold">Provenance</th>
                    <th className="px-4 py-2.5 font-semibold">Last updated</th>
                  </tr>
                </thead>
                <tbody>
                  {cat.features.map((row) => (
                    <tr key={row.name} className="border-b border-border-default/80 hover:bg-bg-card-hover/60">
                      <td className="px-4 py-2.5 font-mono text-[0.68rem] text-syntax-param align-top">
                        {row.name}
                      </td>
                      <td className="px-4 py-2.5 align-top">
                        <FeatureValueCell row={row} />
                      </td>
                      <td className="px-4 py-2.5 text-text-secondary align-top">{row.provenance}</td>
                      <td className="px-4 py-2.5 font-mono text-[0.65rem] tabular-nums text-text-muted align-top whitespace-nowrap">
                        {formatRelativeTime(row.updatedAt, now)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
