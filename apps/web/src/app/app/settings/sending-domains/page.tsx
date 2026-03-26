"use client";

import { Check, Plus, X } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";

type DnsState = "pass" | "fail";

interface SendingDomainRow {
  domain: string;
  type: "outreach" | "transactional" | "sandbox";
  spf: DnsState;
  dkim: DnsState;
  dmarc: DnsState;
  warmupPct: number;
  dailyLimit: number;
  usedToday: number;
  status: "active" | "warming";
}

const MOCK_DOMAINS: SendingDomainRow[] = [
  {
    domain: "go.trustcopilot.com",
    type: "outreach",
    spf: "pass",
    dkim: "pass",
    dmarc: "pass",
    warmupPct: 85,
    dailyLimit: 500,
    usedToday: 423,
    status: "active",
  },
  {
    domain: "app.trustcopilot.com",
    type: "transactional",
    spf: "pass",
    dkim: "pass",
    dmarc: "pass",
    warmupPct: 100,
    dailyLimit: 2000,
    usedToday: 1247,
    status: "active",
  },
  {
    domain: "cert.trustcopilot.com",
    type: "sandbox",
    spf: "pass",
    dkim: "fail",
    dmarc: "fail",
    warmupPct: 20,
    dailyLimit: 50,
    usedToday: 12,
    status: "warming",
  },
  {
    domain: "dev.trustcopilot.com",
    type: "sandbox",
    spf: "pass",
    dkim: "pass",
    dmarc: "pass",
    warmupPct: 100,
    dailyLimit: 100,
    usedToday: 3,
    status: "active",
  },
];

function DnsBadge({ state, label }: { state: DnsState; label: string }) {
  const ok = state === "pass";
  return (
    <Badge
      variant={ok ? "success" : "p0"}
      className="inline-flex h-5 w-5 items-center justify-center p-0 rounded border-0"
      title={`${label}: ${ok ? "verified" : "pending / fail"}`}
      aria-label={`${label} ${ok ? "pass" : "fail"}`}
    >
      {ok ? (
        <Check className="size-3 stroke-[3]" aria-hidden />
      ) : (
        <X className="size-3 stroke-[3]" aria-hidden />
      )}
    </Badge>
  );
}

const typeVariant: Record<SendingDomainRow["type"], "route" | "info" | "default"> = {
  outreach: "route",
  transactional: "info",
  sandbox: "default",
};

export default function SendingDomainsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-mono text-lg font-bold text-text-primary">
          <span className="text-syntax-builtin">def</span> sending_domains
          <span className="text-text-muted">(</span>
          <span className="text-syntax-class">Config</span>
          <span className="text-text-muted">):</span>
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Configure DNS, warmup, and daily limits for outreach and transactional mail
        </p>
      </div>

      <div className="rounded-xl border border-border-default bg-bg-editor overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-default bg-bg-root/40">
              {[
                "Domain",
                "Type",
                "DNS Status",
                "Warmup",
                "Daily limit",
                "Used today",
                "Status",
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2.5 text-left font-mono text-[0.6rem] font-semibold text-text-muted uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_DOMAINS.map((row) => (
              <tr
                key={row.domain}
                className="border-b border-border-default last:border-b-0 hover:bg-bg-card-hover/40 transition-colors"
              >
                <td className="px-4 py-3 font-mono text-xs text-syntax-string font-medium">
                  {row.domain}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={typeVariant[row.type]} className="normal-case tracking-normal text-[0.6rem]">
                    {row.type}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5" title="SPF · DKIM · DMARC">
                    <DnsBadge state={row.spf} label="SPF" />
                    <DnsBadge state={row.dkim} label="DKIM" />
                    <DnsBadge state={row.dmarc} label="DMARC" />
                  </div>
                </td>
                <td className="px-4 py-3 min-w-[140px]">
                  <ProgressBar
                    value={row.warmupPct}
                    max={100}
                    showLabel
                    className="max-w-[9rem]"
                  />
                </td>
                <td className="px-4 py-3 font-mono text-xs text-text-secondary">
                  {row.dailyLimit.toLocaleString()}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-text-secondary">
                  {row.usedToday.toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant={row.status === "active" ? "success" : "warning"}
                    className="normal-case tracking-normal text-[0.6rem]"
                  >
                    {row.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-4">
        <Button size="sm" className="w-fit">
          <Plus size={13} />
          Add Domain
        </Button>

        <Card className="bg-bg-editor">
          <CardHeader>
            <CardTitle className="text-syntax-function">DNS checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-text-secondary leading-relaxed">
              Add the following records at your DNS provider before sending. Values are
              shown for illustration; the live wizard will generate tenant-specific
              records after you add a domain.
            </p>
            <ul className="space-y-3 font-mono text-[0.65rem]">
              <li className="rounded-lg border border-border-default bg-bg-input px-3 py-2.5">
                <span className="text-syntax-keyword">SPF</span>
                <span className="text-text-muted"> — </span>
                <span className="text-text-secondary">TXT @</span>
                <span className="text-text-muted"> → </span>
                <span className="text-syntax-string break-all">
                  v=spf1 include:send.trustcopilot.com ~all
                </span>
              </li>
              <li className="rounded-lg border border-border-default bg-bg-input px-3 py-2.5">
                <span className="text-syntax-keyword">DKIM</span>
                <span className="text-text-muted"> — </span>
                <span className="text-text-secondary">TXT tc._domainkey</span>
                <span className="text-text-muted"> → </span>
                <span className="text-syntax-string break-all">
                  p=MIGfMA0GCS… (CNAME or TXT from dashboard)
                </span>
              </li>
              <li className="rounded-lg border border-border-default bg-bg-input px-3 py-2.5">
                <span className="text-syntax-keyword">DMARC</span>
                <span className="text-text-muted"> — </span>
                <span className="text-text-secondary">TXT _dmarc</span>
                <span className="text-text-muted"> → </span>
                <span className="text-syntax-string break-all">
                  v=DMARC1; p=quarantine; rua=mailto:dmarc@trustcopilot.com
                </span>
              </li>
              <li className="rounded-lg border border-border-default bg-bg-input px-3 py-2.5">
                <span className="text-syntax-decorator">MX</span>
                <span className="text-text-muted"> (optional inbound) — </span>
                <span className="text-text-secondary">priority 10</span>
                <span className="text-text-muted"> → </span>
                <span className="text-syntax-string">inbound.trustcopilot.com</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
