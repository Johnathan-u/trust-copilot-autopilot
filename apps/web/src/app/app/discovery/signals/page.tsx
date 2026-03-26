"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SignalTypeFilter =
  | "all"
  | "soc2"
  | "security_hiring"
  | "trust_center"
  | "iso27001"
  | "compliance_funding"
  | "gdpr"
  | "procurement"
  | "upmarket";

type FreshnessFilter = "all" | "24h" | "7d" | "30d";

interface SignalRow {
  id: string;
  company: string;
  signalType: Exclude<SignalTypeFilter, "all">;
  confidence: number;
  source: string;
  freshnessLabel: string;
  freshnessHours: number;
  negative: boolean;
}

const SIGNAL_TYPE_OPTIONS: SignalTypeFilter[] = [
  "all",
  "soc2",
  "security_hiring",
  "trust_center",
  "iso27001",
  "compliance_funding",
  "gdpr",
  "procurement",
  "upmarket",
];

const FRESHNESS_OPTIONS: { key: FreshnessFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "24h", label: "<24h" },
  { key: "7d", label: "<7d" },
  { key: "30d", label: "<30d" },
];

const MOCK_SIGNALS: SignalRow[] = [
  {
    id: "1",
    company: "Northwind Analytics",
    signalType: "soc2",
    confidence: 0.94,
    source: "trust.northwind.io/security",
    freshnessLabel: "2h ago",
    freshnessHours: 2,
    negative: false,
  },
  {
    id: "2",
    company: "Acme Robotics",
    signalType: "security_hiring",
    confidence: 0.88,
    source: "greenhouse.io/acme/jobs",
    freshnessLabel: "6h ago",
    freshnessHours: 6,
    negative: false,
  },
  {
    id: "3",
    company: "Helios Health",
    signalType: "trust_center",
    confidence: 0.72,
    source: "trust.helios.health",
    freshnessLabel: "14h ago",
    freshnessHours: 14,
    negative: false,
  },
  {
    id: "4",
    company: "FintechOS",
    signalType: "iso27001",
    confidence: 0.91,
    source: "fintechos.com/compliance",
    freshnessLabel: "1d ago",
    freshnessHours: 26,
    negative: false,
  },
  {
    id: "5",
    company: "Vertex Labs",
    signalType: "compliance_funding",
    confidence: 0.67,
    source: "techcrunch.com/2025/vertex-series-c",
    freshnessLabel: "3d ago",
    freshnessHours: 72,
    negative: false,
  },
  {
    id: "6",
    company: "Globex Corp",
    signalType: "gdpr",
    confidence: 0.58,
    source: "globex.eu/dpa-archive",
    freshnessLabel: "18h ago",
    freshnessHours: 18,
    negative: true,
  },
  {
    id: "7",
    company: "Initech SaaS",
    signalType: "procurement",
    confidence: 0.84,
    source: "procurement.initech.com/rfp-8842",
    freshnessLabel: "4h ago",
    freshnessHours: 4,
    negative: false,
  },
  {
    id: "8",
    company: "Umbrella Cloud",
    signalType: "upmarket",
    confidence: 0.79,
    source: "linkedin.com/sales/umbrella",
    freshnessLabel: "9h ago",
    freshnessHours: 9,
    negative: false,
  },
  {
    id: "9",
    company: "Stark Industries",
    signalType: "security_hiring",
    confidence: 0.45,
    source: "lever.co/stark/security-engineer",
    freshnessLabel: "45m ago",
    freshnessHours: 0.75,
    negative: false,
  },
  {
    id: "10",
    company: "Wayne Enterprises",
    signalType: "soc2",
    confidence: 0.96,
    source: "trust.wayne.tech/audits",
    freshnessLabel: "30m ago",
    freshnessHours: 0.5,
    negative: false,
  },
  {
    id: "11",
    company: "Soylent Green",
    signalType: "trust_center",
    confidence: 0.52,
    source: "trust.soylent.green",
    freshnessLabel: "12d ago",
    freshnessHours: 288,
    negative: true,
  },
  {
    id: "12",
    company: "Cyberdyne Systems",
    signalType: "iso27001",
    confidence: 0.9,
    source: "cyberdyne.ai/security-program",
    freshnessLabel: "22h ago",
    freshnessHours: 22,
    negative: false,
  },
];

const signalBadgeVariant: Record<
  Exclude<SignalTypeFilter, "all">,
  | "discovery"
  | "qualification"
  | "tech"
  | "info"
  | "warning"
  | "route"
  | "contact"
  | "success"
  | "default"
> = {
  soc2: "discovery",
  security_hiring: "qualification",
  trust_center: "tech",
  iso27001: "info",
  compliance_funding: "warning",
  gdpr: "route",
  procurement: "contact",
  upmarket: "success",
};

function confidenceClass(c: number) {
  if (c >= 0.85) return "text-accent-green";
  if (c >= 0.65) return "text-accent-yellow";
  return "text-accent-red";
}

function passesFreshness(hours: number, f: FreshnessFilter) {
  if (f === "all") return true;
  if (f === "24h") return hours < 24;
  if (f === "7d") return hours < 24 * 7;
  if (f === "30d") return hours < 24 * 30;
  return true;
}

export default function SignalExplorerPage() {
  const [search, setSearch] = useState("");
  const [signalType, setSignalType] = useState<SignalTypeFilter>("all");
  const [freshness, setFreshness] = useState<FreshnessFilter>("all");
  const [negativesOnly, setNegativesOnly] = useState(false);

  const filtered = useMemo(() => {
    return MOCK_SIGNALS.filter((row) => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !row.company.toLowerCase().includes(q) &&
          !row.source.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      if (signalType !== "all" && row.signalType !== signalType) return false;
      if (!passesFreshness(row.freshnessHours, freshness)) return false;
      if (negativesOnly && !row.negative) return false;
      return true;
    });
  }, [search, signalType, freshness, negativesOnly]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-mono text-lg font-bold text-text-primary">
          <span className="text-syntax-builtin">def</span> signal_explorer
          <span className="text-text-muted">(</span>
          <span className="text-syntax-class">View</span>
          <span className="text-text-muted">):</span>
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Browse extracted atomic signals with filters
        </p>
      </div>

      <Card className="border-border-default bg-bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-mono text-sm text-text-secondary">
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Input
              placeholder="Search company or source…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-7 w-56 max-w-full bg-bg-input text-[0.68rem] font-mono text-text-primary placeholder:text-text-muted"
            />
            <Button
              type="button"
              variant={negativesOnly ? "default" : "outline"}
              size="sm"
              className="h-6 font-mono text-[0.6rem]"
              onClick={() => setNegativesOnly((v) => !v)}
            >
              Negative signals only
            </Button>
          </div>

          <div>
            <div className="mb-1.5 font-mono text-[0.58rem] uppercase tracking-wider text-text-muted">
              Signal type
            </div>
            <div className="flex flex-wrap gap-1">
              {SIGNAL_TYPE_OPTIONS.map((t) => (
                <Button
                  key={t}
                  type="button"
                  variant={signalType === t ? "default" : "outline"}
                  size="sm"
                  className="h-6 px-2 font-mono text-[0.58rem]"
                  onClick={() => setSignalType(t)}
                >
                  {t === "all" ? "all" : t}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-1.5 font-mono text-[0.58rem] uppercase tracking-wider text-text-muted">
              Freshness
            </div>
            <div className="flex flex-wrap gap-1">
              {FRESHNESS_OPTIONS.map(({ key, label }) => (
                <Button
                  key={key}
                  type="button"
                  variant={freshness === key ? "default" : "outline"}
                  size="sm"
                  className="h-6 px-2 font-mono text-[0.6rem]"
                  onClick={() => setFreshness(key)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border-default bg-bg-editor overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-border-default bg-bg-root">
                  {[
                    "Company",
                    "Signal Type",
                    "Confidence",
                    "Source",
                    "Freshness",
                    "Negative?",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-left font-mono text-[0.6rem] font-semibold uppercase tracking-wider text-text-muted"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr
                    key={row.id}
                    className={cn(
                      "border-b border-border-default transition-colors hover:bg-bg-card",
                      row.negative && "bg-accent-red/5"
                    )}
                  >
                    <td className="px-4 py-2.5 font-mono text-xs font-medium text-text-primary">
                      {row.company}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge variant={signalBadgeVariant[row.signalType]}>
                        {row.signalType}
                      </Badge>
                    </td>
                    <td
                      className={cn(
                        "px-4 py-2.5 font-mono text-xs font-semibold",
                        confidenceClass(row.confidence)
                      )}
                    >
                      {(row.confidence * 100).toFixed(0)}%
                    </td>
                    <td className="max-w-[240px] truncate px-4 py-2.5 font-mono text-[0.65rem] text-syntax-string">
                      {row.source}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-[0.68rem] text-text-secondary">
                      {row.freshnessLabel}
                    </td>
                    <td className="px-4 py-2.5">
                      {row.negative ? (
                        <span className="font-mono text-[0.65rem] font-semibold text-accent-red">
                          Yes
                        </span>
                      ) : (
                        <span className="font-mono text-[0.65rem] text-text-muted">
                          No
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-border-default bg-bg-root px-4 py-2.5">
            <span className="font-mono text-[0.62rem] text-text-muted">
              Total:{" "}
              <span className="text-syntax-decorator">{filtered.length}</span>{" "}
              signal{filtered.length === 1 ? "" : "s"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
