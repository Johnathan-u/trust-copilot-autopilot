"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KpiCard } from "@/components/ui/kpi-card";
import { StateChip } from "@/components/ui/state-chip";
import { cn } from "@/lib/utils";

type Segment = "SMB" | "Mid-Market" | "Enterprise";
type StageFilter =
  | "all"
  | "qualified_account"
  | "contactable"
  | "contacted"
  | "replied"
  | "paid";

const MOCK_ACCOUNTS = [
  {
    id: "nimbus-security",
    company: "Nimbus Security",
    state: "replied" as const,
    icpScore: 94,
    painType: "SOC 2 Type II deadline",
    segment: "Mid-Market" as Segment,
    lastSignal: "security_hiring_spike",
    expectedValue: "$42k",
    lastAction: "Revival thread — procurement CC'd",
  },
  {
    id: "trustlayer",
    company: "TrustLayer",
    state: "paid" as const,
    icpScore: 91,
    painType: "Vendor risk automation",
    segment: "Enterprise" as Segment,
    lastSignal: "trust_center_redesign",
    expectedValue: "$118k",
    lastAction: "MSA countersigned",
  },
  {
    id: "cybernova",
    company: "CyberNova",
    state: "contacted" as const,
    icpScore: 88,
    painType: "FedRAMP prep",
    segment: "Enterprise" as Segment,
    lastSignal: "compliance_funding",
    expectedValue: "$96k",
    lastAction: "Cold outbound — security lead",
  },
  {
    id: "cloudvault",
    company: "CloudVault",
    state: "qualified_account" as const,
    icpScore: 85,
    painType: "Data residency + ISO",
    segment: "Mid-Market" as Segment,
    lastSignal: "iso27001_job_posts",
    expectedValue: "$31k",
    lastAction: "ICP model — high fit",
  },
  {
    id: "datashield",
    company: "DataShield",
    state: "contactable" as const,
    icpScore: 82,
    painType: "GDPR DPIA backlog",
    segment: "SMB" as Segment,
    lastSignal: "privacy_policy_update",
    expectedValue: "$18k",
    lastAction: "Enriched — DPO identified",
  },
  {
    id: "securestack",
    company: "SecureStack",
    state: "paid" as const,
    icpScore: 78,
    painType: "Pen test remediation",
    segment: "Mid-Market" as Segment,
    lastSignal: "customer_audit_mention",
    expectedValue: "$54k",
    lastAction: "Invoice paid — net-30",
  },
  {
    id: "shieldforce",
    company: "ShieldForce",
    state: "contacted" as const,
    icpScore: 72,
    painType: "SSO + SCIM rollout",
    segment: "SMB" as Segment,
    lastSignal: "engineering_blog_auth",
    expectedValue: "$14k",
    lastAction: "LinkedIn sequence step 2",
  },
  {
    id: "complianceio",
    company: "ComplianceIO",
    state: "qualified_account" as const,
    icpScore: 68,
    painType: "Continuous controls",
    segment: "Mid-Market" as Segment,
    lastSignal: "soc2_announced",
    expectedValue: "$27k",
    lastAction: "Score bump — fresh signals",
  },
  {
    id: "privacyfirst",
    company: "PrivacyFirst",
    state: "contactable" as const,
    icpScore: 61,
    painType: "Cookie consent platform",
    segment: "SMB" as Segment,
    lastSignal: "cmp_vendor_eval",
    expectedValue: "$9k",
    lastAction: "Awaiting contact window",
  },
  {
    id: "govguard",
    company: "GovGuard",
    state: "paid" as const,
    icpScore: 55,
    painType: "StateRAMP alignment",
    segment: "Enterprise" as Segment,
    lastSignal: "gov_procurement_rfp",
    expectedValue: "$210k",
    lastAction: "Expansion — add'l BU",
  },
];

function icpScoreClass(score: number) {
  if (score >= 80) return "text-accent-green";
  if (score >= 65) return "text-accent-yellow";
  return "text-accent-red";
}

const STAGE_FILTERS: { key: StageFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "qualified_account", label: "Qualified" },
  { key: "contactable", label: "Contactable" },
  { key: "contacted", label: "Contacted" },
  { key: "replied", label: "Replied" },
  { key: "paid", label: "Paid" },
];

const SEGMENT_FILTERS: { key: Segment | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "SMB", label: "SMB" },
  { key: "Mid-Market", label: "Mid-Market" },
  { key: "Enterprise", label: "Enterprise" },
];

export default function AccountPipelinePage() {
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState<StageFilter>("all");
  const [segment, setSegment] = useState<Segment | "all">("all");

  const totals = useMemo(() => {
    const total = MOCK_ACCOUNTS.length;
    const qualified = MOCK_ACCOUNTS.filter((a) => a.state === "qualified_account").length;
    const contacted = MOCK_ACCOUNTS.filter((a) => a.state === "contacted").length;
    const paid = MOCK_ACCOUNTS.filter((a) => a.state === "paid").length;
    const conversionPct = total ? Math.round((paid / total) * 100) : 0;
    return { total, qualified, contacted, conversionPct };
  }, []);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return MOCK_ACCOUNTS.filter((a) => {
      if (q && !a.company.toLowerCase().includes(q)) return false;
      if (stage !== "all" && a.state !== stage) return false;
      if (segment !== "all" && a.segment !== segment) return false;
      return true;
    }).sort((a, b) => b.icpScore - a.icpScore);
  }, [search, stage, segment]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-mono text-lg font-bold text-text-primary">
          <span className="text-syntax-builtin">def</span> account_pipeline
          <span className="text-text-muted">(</span>
          <span className="text-syntax-class">View</span>
          <span className="text-text-muted">):</span>
        </h1>
        <p className="text-xs text-text-muted mt-1">
          All accounts by stage, scores, freshness, and segment
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <KpiCard label="Total accounts" value={totals.total} accent="blue" />
        <KpiCard label="Qualified" value={totals.qualified} accent="purple" />
        <KpiCard label="Contacted" value={totals.contacted} accent="orange" />
        <KpiCard
          label="Conversion rate"
          value={`${totals.conversionPct}%`}
          sub="Paid ÷ pipeline (mock)"
          accent="green"
        />
      </div>

      <div className="rounded-xl border border-border-default bg-bg-editor p-4 space-y-4">
        <div className="flex flex-col gap-3">
          <Input
            placeholder="Search company…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="font-mono text-xs bg-bg-input border-border-default max-w-md"
          />
          <div className="space-y-2">
            <div className="font-mono text-[0.62rem] uppercase tracking-wider text-text-muted">
              State
            </div>
            <div className="flex flex-wrap gap-2">
              {STAGE_FILTERS.map(({ key, label }) => (
                <Button
                  key={key}
                  type="button"
                  size="sm"
                  variant={stage === key ? "default" : "outline"}
                  className={cn(
                    stage === key &&
                      "shadow-[0_0_12px_rgba(156,220,254,0.12)] border-border-active"
                  )}
                  onClick={() => setStage(key)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <div className="font-mono text-[0.62rem] uppercase tracking-wider text-text-muted">
              Segment
            </div>
            <div className="flex flex-wrap gap-2">
              {SEGMENT_FILTERS.map(({ key, label }) => (
                <Button
                  key={key}
                  type="button"
                  size="sm"
                  variant={segment === key ? "default" : "outline"}
                  className={cn(
                    segment === key &&
                      "shadow-[0_0_12px_rgba(156,220,254,0.12)] border-border-active"
                  )}
                  onClick={() => setSegment(key)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden border-border-default bg-bg-editor">
        <CardHeader className="py-3">
          <CardTitle>Pipeline</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-default bg-bg-card font-mono text-[0.62rem] uppercase tracking-wider text-text-muted">
                  <th className="px-5 py-3 font-medium">Company</th>
                  <th className="px-5 py-3 font-medium">State</th>
                  <th className="px-5 py-3 font-medium">ICP score</th>
                  <th className="px-5 py-3 font-medium">Pain type</th>
                  <th className="px-5 py-3 font-medium">Segment</th>
                  <th className="px-5 py-3 font-medium">Last signal</th>
                  <th className="px-5 py-3 font-medium">Expected value</th>
                  <th className="px-5 py-3 font-medium">Last action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-border-default last:border-0 hover:bg-bg-card-hover/60 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <Link
                        href={`/app/accounts/${row.id}`}
                        className="font-mono text-sm font-semibold text-text-primary hover:text-syntax-param"
                      >
                        {row.company}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <StateChip state={row.state} />
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          "font-mono text-sm font-bold tabular-nums",
                          icpScoreClass(row.icpScore)
                        )}
                      >
                        {row.icpScore}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-text-secondary">
                      {row.painType}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-syntax-string">
                      {row.segment}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-syntax-decorator">
                      {row.lastSignal}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-syntax-function tabular-nums">
                      {row.expectedValue}
                    </td>
                    <td className="px-5 py-3 text-xs text-text-secondary max-w-[220px]">
                      {row.lastAction}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <p className="font-mono text-[0.62rem] text-text-muted">
        Showing <span className="text-syntax-param">{rows.length}</span> of{" "}
        <span className="text-text-secondary">{MOCK_ACCOUNTS.length}</span> accounts
        <span className="text-text-muted"> · sorted by ICP score (desc)</span>
      </p>
    </div>
  );
}
