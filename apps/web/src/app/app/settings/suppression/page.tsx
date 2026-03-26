"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KpiCard } from "@/components/ui/kpi-card";

const GLOBAL_ENTRIES = [
  { value: "*.malicious-phish.net", reason: "Phishing campaign", date: "2025-03-10", by: "system" },
  { value: "spamhaus-listed.io", reason: "DNSBL listing", date: "2025-03-08", by: "compliance@acme.com" },
  { value: "unsub@legal-hold.org", reason: "Litigation hold", date: "2025-02-22", by: "legal@acme.com" },
  { value: "bouncestorm.svc", reason: "Hard bounce storm", date: "2025-03-18", by: "deliverability-bot" },
] as const;

const COMPETITOR_ENTRIES = [
  { value: "competitor-alpha.com", reason: "CRM overlap + hiring signals", date: "2025-03-20", by: "auto-detect" },
  { value: "rival-saas.io", reason: "Shared investor portfolio", date: "2025-03-19", by: "auto-detect" },
  { value: "other-vendor.co", reason: "Keyword: competitor landing", date: "2025-03-12", by: "auto-detect" },
] as const;

const MANUAL_ENTRIES = [
  { value: "ceo@partner-firm.com", reason: "Requested no contact", date: "2025-03-21", by: "jane@acme.com" },
  { value: "procurement@gov-agency.gov", reason: "FedRAMP scope", date: "2025-03-15", by: "ops@acme.com" },
  { value: "blocked-domain.org", reason: "One-off block", date: "2025-03-11", by: "jane@acme.com" },
  { value: "noreply@angry-prospect.io", reason: "Explicit complaint", date: "2025-03-09", by: "inbox-sync" },
] as const;

const LISTS = [
  {
    id: "global",
    title: "Global Suppression",
    subtitle: "Company-wide blocks",
    count: 1284,
    lastUpdated: "2025-03-21 14:02 UTC",
    entries: GLOBAL_ENTRIES,
  },
  {
    id: "competitor",
    title: "Competitor Domains",
    subtitle: "Auto-detected competitors",
    count: 56,
    lastUpdated: "2025-03-21 09:41 UTC",
    entries: COMPETITOR_ENTRIES,
  },
  {
    id: "manual",
    title: "Manual Blocks",
    subtitle: "User-added entries",
    count: 312,
    lastUpdated: "2025-03-20 22:18 UTC",
    entries: MANUAL_ENTRIES,
  },
] as const;

export default function SuppressionListsPage() {
  const [query, setQuery] = useState("");

  const filteredLists = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return LISTS;
    return LISTS.map((list) => ({
      ...list,
      entries: list.entries.filter(
        (e) =>
          e.value.toLowerCase().includes(q) ||
          e.reason.toLowerCase().includes(q) ||
          e.by.toLowerCase().includes(q)
      ),
    }));
  }, [query]);

  const totalEntries = 1284 + 56 + 312;
  const domainsBlocked = 842;
  const emailsBlocked = 810;
  const recentAdditions = 23;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-mono text-lg font-bold text-text-primary">
            <span className="text-syntax-builtin">def</span> suppression_lists
            <span className="text-text-muted">(</span>
            <span className="text-syntax-class">Config</span>
            <span className="text-text-muted">):</span>
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Global, competitor, and manual deny lists applied before send
          </p>
        </div>
        <Button className="shrink-0">
          Add suppression
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total suppressed entries" value={totalEntries} accent="blue" />
        <KpiCard label="Domains blocked" value={domainsBlocked} accent="teal" />
        <KpiCard label="Emails blocked" value={emailsBlocked} accent="purple" />
        <KpiCard label="Recent additions (7d)" value={recentAdditions} accent="orange" sub="Across all lists" />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted pointer-events-none" />
        <Input
          placeholder="Search domain, email, reason, or added by…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 bg-bg-input"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {filteredLists.map((list) => (
          <Card key={list.id} className="bg-bg-card border-border-default flex flex-col">
            <CardHeader className="flex-col items-stretch gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="text-syntax-param">{list.title}</CardTitle>
                <p className="text-xs text-text-muted mt-1 font-mono">{list.subtitle}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="discovery">{list.count} rows</Badge>
                <span className="font-mono text-[0.65rem] text-text-muted">
                  updated {list.lastUpdated}
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-[0.7rem]">
                  <thead>
                    <tr className="border-y border-border-default bg-bg-editor text-text-muted uppercase tracking-wider">
                      <th className="px-4 py-2 font-semibold">Suppressed</th>
                      <th className="px-4 py-2 font-semibold">Reason</th>
                      <th className="px-4 py-2 font-semibold">Added</th>
                      <th className="px-4 py-2 font-semibold">By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-default text-text-secondary">
                    {list.entries.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-text-muted">
                          No matches for <span className="text-syntax-string">&quot;{query}&quot;</span>
                        </td>
                      </tr>
                    ) : (
                      list.entries.map((row) => (
                        <tr key={`${list.id}-${row.value}`} className="hover:bg-bg-card-hover transition-colors">
                          <td className="px-4 py-2.5 text-syntax-string break-all">{row.value}</td>
                          <td className="px-4 py-2.5 text-text-primary">{row.reason}</td>
                          <td className="px-4 py-2.5 text-syntax-builtin whitespace-nowrap">{row.date}</td>
                          <td className="px-4 py-2.5 text-syntax-param">{row.by}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
