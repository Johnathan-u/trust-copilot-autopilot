"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  FileText,
  Mail,
  MessageSquare,
  Package,
  Radio,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StateChip } from "@/components/ui/state-chip";
import { EmptyState } from "@/components/ui/states";
import { cn } from "@/lib/utils";

type TabId =
  | "overview"
  | "signals"
  | "buyers"
  | "contact"
  | "messaging"
  | "fulfillment"
  | "audit";

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "signals", label: "Signals" },
  { id: "buyers", label: "Buyers" },
  { id: "contact", label: "Contact" },
  { id: "messaging", label: "Messaging" },
  { id: "fulfillment", label: "Fulfillment" },
  { id: "audit", label: "Audit" },
];

const ACCOUNT_DETAIL: Record<
  string,
  {
    name: string;
    domain: string;
    state: string;
    icpScore: number;
    painType: string;
    segment: string;
    brief: string;
    scorecards: {
      label: string;
      score: number;
      explain: string;
      barColor: string;
    }[];
    competitorNote: string;
    negativeSignals: string;
  }
> = {
  "nimbus-security": {
    name: "Nimbus Security",
    domain: "nimbussec.io",
    state: "replied",
    icpScore: 94,
    painType: "SOC 2 Type II deadline",
    segment: "Mid-Market",
    brief:
      "Nimbus is mid-flight on a Type II audit with a hard board commitment in Q2. Their security team doubled in six months while the trust page still promises “SOC 2 coming soon,” which usually means procurement is already asking for evidence. A spike in GRC and IAM hiring plus a revived thread with legal CC’d suggests budget and urgency are real—not exploratory.",
    scorecards: [
      {
        label: "ICP fit",
        score: 92,
        explain: "B2B SaaS, security-led buyer, ACV in band.",
        barColor: "var(--color-accent-green)",
      },
      {
        label: "Pain severity",
        score: 88,
        explain: "Audit deadline + customer questionnaires piling up.",
        barColor: "var(--color-syntax-keyword)",
      },
      {
        label: "Urgency",
        score: 85,
        explain: "Procurement engaged; competitor eval likely this quarter.",
        barColor: "var(--color-syntax-decorator)",
      },
      {
        label: "Expected value",
        score: 78,
        explain: "Land with SOC 2 bundle; expand to ISO next year.",
        barColor: "var(--color-syntax-class)",
      },
    ],
    competitorNote: "Vanta and Drata mentioned in a job description for “compliance automation owner.”",
    negativeSignals: "No recent funding; one open VP Eng role unfilled 90+ days.",
  },
  trustlayer: {
    name: "TrustLayer",
    domain: "trustlayer.com",
    state: "paid",
    icpScore: 91,
    painType: "Vendor risk automation",
    segment: "Enterprise",
    brief:
      "TrustLayer is consolidating third-party risk onto a single pane after a messy audit season. They recently shipped a redesigned trust center and are hiring for “customer trust operations,” which typically precedes a formal vendor-security program. Legal is driving timeline: they need repeatable evidence exchange before renewals hit in April.",
    scorecards: [
      {
        label: "ICP fit",
        score: 96,
        explain: "Enterprise program, multi-stakeholder security + legal.",
        barColor: "var(--color-accent-green)",
      },
      {
        label: "Pain severity",
        score: 90,
        explain: "Manual questionnaires and stale artifacts blocking deals.",
        barColor: "var(--color-syntax-keyword)",
      },
      {
        label: "Urgency",
        score: 82,
        explain: "Renewal window + exec visibility on vendor backlog.",
        barColor: "var(--color-syntax-decorator)",
      },
      {
        label: "Expected value",
        score: 94,
        explain: "High seat count; strong upsell to continuous monitoring.",
        barColor: "var(--color-syntax-class)",
      },
    ],
    competitorNote: "SecurityScorecard referenced in RFP materials (scraped from careers page PDF).",
    negativeSignals: "Internal “trust portal 2.0” project name seen in commits—may delay external buy.",
  },
  cybernova: {
    name: "CyberNova",
    domain: "cybernova.defense",
    state: "contacted",
    icpScore: 88,
    painType: "FedRAMP prep",
    segment: "Enterprise",
    brief:
      "CyberNova closed a compliance-oriented growth round and immediately posted FedRAMP-adjacent roles. Their public roadmap hints at a federal wedge while commercial SOC 2 is still the revenue engine—classic split focus. Outreach landed with the security lead; no reply yet, but engagement on trust content is up week over week.",
    scorecards: [
      {
        label: "ICP fit",
        score: 89,
        explain: "Regulated buyer, complex evidence needs.",
        barColor: "var(--color-accent-green)",
      },
      {
        label: "Pain severity",
        score: 86,
        explain: "Dual track: commercial audits + federal authorization.",
        barColor: "var(--color-syntax-keyword)",
      },
      {
        label: "Urgency",
        score: 74,
        explain: "Long cycles; motion depends on PMO prioritization.",
        barColor: "var(--color-syntax-decorator)",
      },
      {
        label: "Expected value",
        score: 91,
        explain: "Large footprint; professional services attach likely.",
        barColor: "var(--color-syntax-class)",
      },
    ],
    competitorNote: "Deloitte and Coalfire mentioned in a webinar abstract (partner-led assessment path).",
    negativeSignals: "Heavy services bias may cap software budget this fiscal year.",
  },
  cloudvault: {
    name: "CloudVault",
    domain: "cloudvault.app",
    state: "qualified_account",
    icpScore: 85,
    painType: "Data residency + ISO",
    segment: "Mid-Market",
    brief:
      "CloudVault is expanding into the EU while enterprise deals stall on data residency attestations. ISO 27001 job posts appeared the same week they updated subprocessors—signals that infosec is formalizing controls, not firefighting. No outbound yet; qualification is model-driven with high ICP overlap to similar wins.",
    scorecards: [
      {
        label: "ICP fit",
        score: 87,
        explain: "Product-led growth with emerging enterprise pull.",
        barColor: "var(--color-accent-green)",
      },
      {
        label: "Pain severity",
        score: 79,
        explain: "Deals blocked on residency and ISO evidence gaps.",
        barColor: "var(--color-syntax-keyword)",
      },
      {
        label: "Urgency",
        score: 71,
        explain: "EU GTM push creates a natural deadline.",
        barColor: "var(--color-syntax-decorator)",
      },
      {
        label: "Expected value",
        score: 68,
        explain: "Land ISO package; expand to SOC 2 for US HQ.",
        barColor: "var(--color-syntax-class)",
      },
    ],
    competitorNote: "No direct competitor logos detected on trust site.",
    negativeSignals: "Lean team—implementation bandwidth may be constrained.",
  },
  datashield: {
    name: "DataShield",
    domain: "datashield.co",
    state: "contactable",
    icpScore: 82,
    painType: "GDPR DPIA backlog",
    segment: "SMB",
    brief:
      "DataShield’s privacy policy rewrite and new DPO hire point to a compliance reset after a noisy regulator inquiry (inferred from counsel blog posts). They are SMB-weighted but sell upstream into regulated SMBs, so DPIA throughput matters for sales velocity. Contact window opens next week per persona rules.",
    scorecards: [
      {
        label: "ICP fit",
        score: 76,
        explain: "SMB ACV but strong privacy-led motion.",
        barColor: "var(--color-accent-yellow)",
      },
      {
        label: "Pain severity",
        score: 84,
        explain: "Backlog of DPIAs tied to pipeline commits.",
        barColor: "var(--color-syntax-keyword)",
      },
      {
        label: "Urgency",
        score: 69,
        explain: "Legal-led; may pause for outside counsel review.",
        barColor: "var(--color-syntax-decorator)",
      },
      {
        label: "Expected value",
        score: 58,
        explain: "Starter package; expansion if EU revenue grows.",
        barColor: "var(--color-syntax-class)",
      },
    ],
    competitorNote: "OneTrust cookie banner competitor set detected on marketing site.",
    negativeSignals: "Price-sensitive segment; discount pressure likely.",
  },
  securestack: {
    name: "SecureStack",
    domain: "securestack.dev",
    state: "paid",
    icpScore: 78,
    painType: "Pen test remediation",
    segment: "Mid-Market",
    brief:
      "SecureStack failed a customer audit on evidence freshness and is scrambling to operationalize continuous control testing. Their changelog shows frantic access-review automation work—usually the trigger for a consolidated trust platform. They have already paid; this workspace is focused on fulfillment and expansion hooks.",
    scorecards: [
      {
        label: "ICP fit",
        score: 81,
        explain: "Dev tooling with security champions embedded.",
        barColor: "var(--color-accent-green)",
      },
      {
        label: "Pain severity",
        score: 83,
        explain: "Customer audit findings created executive air cover.",
        barColor: "var(--color-syntax-keyword)",
      },
      {
        label: "Urgency",
        score: 88,
        explain: "Remediation deadlines are weeks, not quarters.",
        barColor: "var(--color-syntax-decorator)",
      },
      {
        label: "Expected value",
        score: 72,
        explain: "Paid land; upsell continuous evidence sync.",
        barColor: "var(--color-syntax-class)",
      },
    ],
    competitorNote: "Laika referenced in Slack community screenshot (user-submitted signal).",
    negativeSignals: "Engineering capacity split with core product reliability work.",
  },
  shieldforce: {
    name: "ShieldForce",
    domain: "shieldforce.io",
    state: "contacted",
    icpScore: 72,
    painType: "SSO + SCIM rollout",
    segment: "SMB",
    brief:
      "ShieldForce is rolling enterprise SSO to unblock upmarket deals but their trust narrative still reads consumer-grade. Engineering blog posts on SCIM indicate implementation pain that often spills into “prove your security program” conversations. Sequence step 2 is live; awaiting reply.",
    scorecards: [
      {
        label: "ICP fit",
        score: 70,
        explain: "PLG with emerging enterprise requirements.",
        barColor: "var(--color-accent-yellow)",
      },
      {
        label: "Pain severity",
        score: 74,
        explain: "SSO blockers directly tied to closed-lost reasons.",
        barColor: "var(--color-syntax-keyword)",
      },
      {
        label: "Urgency",
        score: 77,
        explain: "Sales pushing for Q2 enterprise closes.",
        barColor: "var(--color-syntax-decorator)",
      },
      {
        label: "Expected value",
        score: 55,
        explain: "Smaller ACV unless security package bundles.",
        barColor: "var(--color-syntax-class)",
      },
    ],
    competitorNote: "Okta deployment guides linked; no GRC competitor surfaced.",
    negativeSignals: "Single-threaded IT contact—risk of stall if champion deprioritizes.",
  },
  complianceio: {
    name: "ComplianceIO",
    domain: "complianceio.com",
    state: "qualified_account",
    icpScore: 68,
    painType: "Continuous controls",
    segment: "Mid-Market",
    brief:
      "ComplianceIO markets to regulated SMBs but is climbing into mid-market with SOC 2 as the wedge. A fresh SOC 2 announcement plus stagnant policy dates suggest they are about to refresh the whole trust story. Model confidence dropped slightly after a leadership change—worth validating champion still owns budget.",
    scorecards: [
      {
        label: "ICP fit",
        score: 75,
        explain: "Compliance-native ICP; good expansion symmetry.",
        barColor: "var(--color-accent-yellow)",
      },
      {
        label: "Pain severity",
        score: 72,
        explain: "Manual evidence pulls for every enterprise deal.",
        barColor: "var(--color-syntax-keyword)",
      },
      {
        label: "Urgency",
        score: 63,
        explain: "Leadership churn may reset procurement timeline.",
        barColor: "var(--color-syntax-decorator)",
      },
      {
        label: "Expected value",
        score: 66,
        explain: "Land controls automation; grow with headcount.",
        barColor: "var(--color-syntax-class)",
      },
    ],
    competitorNote: "Secureframe mentioned by a reviewer on G2 (low confidence).",
    negativeSignals: "Recent VP Customer Success exit—relationship risk.",
  },
  privacyfirst: {
    name: "PrivacyFirst",
    domain: "privacyfirst.tech",
    state: "contactable",
    icpScore: 61,
    painType: "Cookie consent platform",
    segment: "SMB",
    brief:
      "PrivacyFirst is evaluating CMP vendors while their marketing site still loads third-party trackers inconsistently—a tell that the compliance team is not yet aligned with growth. Signals are steady but low amplitude; best play is education-heavy outreach once the contact window opens.",
    scorecards: [
      {
        label: "ICP fit",
        score: 62,
        explain: "Privacy-adjacent but immature security posture.",
        barColor: "var(--color-accent-yellow)",
      },
      {
        label: "Pain severity",
        score: 58,
        explain: "Risk is reputational more than revenue-blocking today.",
        barColor: "var(--color-syntax-keyword)",
      },
      {
        label: "Urgency",
        score: 52,
        explain: "No hard external deadline observed.",
        barColor: "var(--color-syntax-decorator)",
      },
      {
        label: "Expected value",
        score: 48,
        explain: "Narrow initial SKU; nurture for 6–12 months.",
        barColor: "var(--color-syntax-class)",
      },
    ],
    competitorNote: "Cookiebot and Osano in vendor comparison blog comments.",
    negativeSignals: "Low digital maturity—long enablement runway.",
  },
  govguard: {
    name: "GovGuard",
    domain: "govguard.gov",
    state: "paid",
    icpScore: 55,
    painType: "StateRAMP alignment",
    segment: "Enterprise",
    brief:
      "GovGuard is expanding StateRAMP alignment across agencies after a successful pilot; paid expansion reflects multi-BU adoption. ICP score is moderated by procurement complexity, not lack of fit. Narrative focus should stay on authorization evidence, SLA-backed workflows, and audit defensibility.",
    scorecards: [
      {
        label: "ICP fit",
        score: 93,
        explain: "Public sector program with formal authorization needs.",
        barColor: "var(--color-accent-green)",
      },
      {
        label: "Pain severity",
        score: 87,
        explain: "Authorization gates on multi-tenant architecture.",
        barColor: "var(--color-syntax-keyword)",
      },
      {
        label: "Urgency",
        score: 79,
        explain: "Agency mandates drive sequencing more than sales cycles.",
        barColor: "var(--color-syntax-decorator)",
      },
      {
        label: "Expected value",
        score: 97,
        explain: "Large seat expansion; multi-year potential.",
        barColor: "var(--color-syntax-class)",
      },
    ],
    competitorNote: "Traditional GRC incumbents dominate RFP language.",
    negativeSignals: "Slow paperwork; revenue recognition can lag milestones.",
  },
};

type TabPlaceholder = Exclude<TabId, "overview">;

const TAB_EMPTY: Record<
  TabPlaceholder,
  { icon: LucideIcon; title: string; description: string }
> = {
  signals: {
    icon: Radio,
    title: "Signals",
    description: "Signal timeline, confidence, and source lineage will appear here.",
  },
  buyers: {
    icon: Users,
    title: "Buyers",
    description: "Personas, champions, and buying committee map — coming soon.",
  },
  contact: {
    icon: Mail,
    title: "Contact",
    description: "Sequences, touches, and reply tracking will live in this tab.",
  },
  messaging: {
    icon: MessageSquare,
    title: "Messaging",
    description: "Approved talk tracks, snippets, and objection handling — placeholder.",
  },
  fulfillment: {
    icon: Package,
    title: "Fulfillment",
    description: "Scope, delivery status, and artifact checklist — not wired yet.",
  },
  audit: {
    icon: FileText,
    title: "Audit",
    description: "Immutable change log and operator notes — coming soon.",
  },
};

export default function AccountDetailPage() {
  const params = useParams();
  const accountId = typeof params.accountId === "string" ? params.accountId : "";
  const [tab, setTab] = useState<TabId>("overview");

  const account = ACCOUNT_DETAIL[accountId];

  if (!account) {
    return (
      <div className="space-y-6">
        <EmptyState
          title="Account not found"
          description={`No mock workspace for id “${accountId || "—"}”. Open an account from the pipeline list.`}
        />
      </div>
    );
  }

  return (
    <div className="space-y-0">
      <div className="sticky top-0 z-10 -mx-6 px-6 py-4 border-b border-border-default bg-bg-root/95 backdrop-blur-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2 min-w-0">
            <h1 className="font-mono text-lg font-bold text-text-primary truncate">
              {account.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 gap-y-2">
              <span className="font-mono text-xs text-syntax-string">{account.domain}</span>
              <StateChip state={account.state} />
              <span className="font-mono text-xs text-text-muted">·</span>
              <span className="font-mono text-xs text-text-secondary">
                ICP <span className="text-syntax-builtin font-semibold">{account.icpScore}</span>
              </span>
              <span className="font-mono text-xs text-text-muted">·</span>
              <span className="font-mono text-xs text-syntax-operator">{account.painType}</span>
              <span className="font-mono text-xs text-text-muted">·</span>
              <span className="font-mono text-xs text-syntax-decorator">{account.segment}</span>
            </div>
          </div>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-1 mt-4 border-b border-border-default -mb-px">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "font-mono text-[0.65rem] font-semibold uppercase tracking-wider pb-2.5 -mb-px border-b-2 transition-colors",
                tab === t.id
                  ? "text-syntax-param border-syntax-param"
                  : "text-text-muted border-transparent hover:text-text-secondary"
              )}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="pt-2 pb-8">
        {tab === "overview" && (
          <div className="space-y-6 pt-4">
            <Card className="border-border-default bg-bg-editor">
              <CardHeader>
                <CardTitle>Research brief</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text-secondary leading-relaxed">{account.brief}</p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              {account.scorecards.map((s) => (
                <Card
                  key={s.label}
                  className="border-border-default bg-bg-card hover:border-border-active transition-colors"
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="font-mono text-[0.62rem] uppercase tracking-wider text-text-muted">
                      {s.label}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-2xl font-bold text-syntax-builtin tabular-nums">
                        {s.score}
                      </span>
                      <span className="font-mono text-xs text-text-muted">/ 100</span>
                    </div>
                    <ProgressBar value={s.score} max={100} color={s.barColor} />
                    <p className="text-xs text-text-secondary leading-relaxed">{s.explain}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-border-default bg-bg-editor">
              <CardHeader>
                <CardTitle>Landscape</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="font-mono text-[0.62rem] uppercase tracking-wider text-accent-yellow mb-1.5">
                    Competitors detected
                  </div>
                  <p className="text-sm text-text-secondary">{account.competitorNote}</p>
                </div>
                <div className="border-t border-border-default pt-4">
                  <div className="font-mono text-[0.62rem] uppercase tracking-wider text-accent-red mb-1.5">
                    Negative signals
                  </div>
                  <p className="text-sm text-text-secondary">{account.negativeSignals}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        {tab !== "overview" && (
          <EmptyState
            className="py-12"
            icon={TAB_EMPTY[tab].icon}
            title={TAB_EMPTY[tab].title}
            description={TAB_EMPTY[tab].description}
          />
        )}
      </div>
    </div>
  );
}
