"use client";

import type { DragEvent } from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";

const COMPANY = "Nimbus Security";

type IntegrationId = "aws" | "gcp" | "github" | "jira" | "slack";

const INTEGRATIONS: {
  id: IntegrationId;
  name: string;
  description: string;
}[] = [
  { id: "aws", name: "AWS", description: "Pull configs & evidence from your cloud accounts." },
  { id: "gcp", name: "GCP", description: "Sync projects, IAM, and security posture signals." },
  { id: "github", name: "GitHub", description: "Map repos to controls and track change history." },
  { id: "jira", name: "Jira", description: "Link remediation tickets to audit findings." },
  { id: "slack", name: "Slack", description: "Notify owners when evidence or reviews are due." },
];

const POLICY_TEMPLATES = [
  "Information Security Policy",
  "Acceptable Use Policy",
  "Data Retention & Deletion",
  "Vendor Risk Management",
  "Incident Response Plan",
] as const;

const ROLE_OPTIONS = ["Admin", "Security", "Viewer"] as const;

type InviteRow = { email: string; role: (typeof ROLE_OPTIONS)[number] };

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const totalSteps = 6;
  const progressPct = useMemo(() => Math.round((step / (totalSteps - 1)) * 100), [step]);

  const [integrationStatus, setIntegrationStatus] = useState<Record<IntegrationId, "idle" | "connected">>(
    () => ({
      aws: "idle",
      gcp: "idle",
      github: "idle",
      jira: "idle",
      slack: "idle",
    })
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [policyFiles, setPolicyFiles] = useState<string[]>([]);

  const [logoName, setLogoName] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState("#3B82F6");
  const [accentColor, setAccentColor] = useState("#22C55E");
  const [customDomain, setCustomDomain] = useState("trust.nimbus.security");

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<(typeof ROLE_OPTIONS)[number]>("Security");
  const [invited, setInvited] = useState<InviteRow[]>([
    { email: "jordan.lee@nimbus.security", role: "Admin" },
  ]);

  const connectIntegration = useCallback((id: IntegrationId) => {
    setIntegrationStatus((s) => ({ ...s, [id]: "connected" }));
  }, []);

  const addInvite = useCallback(() => {
    const e = inviteEmail.trim();
    if (!e) return;
    setInvited((list) => [...list, { email: e, role: inviteRole }]);
    setInviteEmail("");
  }, [inviteEmail, inviteRole]);

  const onPolicyDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const names = Array.from(e.dataTransfer.files).map((f) => f.name);
    if (names.length) setPolicyFiles((prev) => [...prev, ...names]);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-mono text-lg font-bold text-text-primary">
          <span className="text-syntax-builtin">def</span> onboarding
          <span className="text-text-muted">(</span>
          <span className="text-syntax-class">Wizard</span>
          <span className="text-text-muted">):</span>
        </h1>
        <p className="mt-1 text-xs text-text-muted">Post-payment workspace setup wizard</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-wider text-text-muted">
            Progress
          </p>
          <span className="font-mono text-xs text-syntax-param tabular-nums">{progressPct}%</span>
        </div>
        <ProgressBar value={progressPct} color="var(--color-accent-green)" />
      </div>

      <div className="flex flex-wrap items-center gap-1.5" aria-label="Wizard steps">
        {Array.from({ length: totalSteps }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setStep(i)}
            className={cn(
              "h-2 w-2 rounded-full transition-colors",
              i === step ? "bg-syntax-param scale-125" : i < step ? "bg-accent-green/70" : "bg-border-default"
            )}
            aria-current={i === step ? "step" : undefined}
            aria-label={`Step ${i + 1}`}
          />
        ))}
      </div>

      {step === 0 && (
        <Card className="border-border-default bg-bg-editor">
          <CardHeader>
            <CardTitle className="font-mono text-syntax-string">
              Welcome to Trust Copilot, {COMPANY}!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-text-secondary">
            <p>
              We&apos;ll connect your stack, import policies, brand your trust center, and invite your
              team—usually under fifteen minutes.
            </p>
            <p className="font-mono text-xs text-text-muted">
              You can revisit this wizard anytime from{" "}
              <span className="text-syntax-keyword">Settings → Onboarding</span>.
            </p>
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <p className="font-mono text-xs font-semibold uppercase tracking-wider text-syntax-builtin">
            Connect integrations
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {INTEGRATIONS.map((int) => (
              <Card key={int.id} className="border-border-default bg-bg-card hover:bg-bg-card-hover">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base text-syntax-class">{int.name}</CardTitle>
                    <Badge variant={integrationStatus[int.id] === "connected" ? "success" : "default"}>
                      {integrationStatus[int.id] === "connected" ? "Connected" : "Not connected"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <p className="text-sm text-text-secondary">{int.description}</p>
                  <Button
                    type="button"
                    size="sm"
                    variant={integrationStatus[int.id] === "connected" ? "outline" : "default"}
                    onClick={() => connectIntegration(int.id)}
                    disabled={integrationStatus[int.id] === "connected"}
                  >
                    {integrationStatus[int.id] === "connected" ? "Connected" : "Connect"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <p className="font-mono text-xs font-semibold uppercase tracking-wider text-syntax-builtin">
            Import policies
          </p>
          <div
            role="region"
            aria-label="Policy upload"
            onDragOver={(e) => e.preventDefault()}
            onDrop={onPolicyDrop}
            className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border-default bg-bg-input px-6 py-10 text-center transition-colors hover:border-border-active hover:bg-bg-card-hover/50"
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            tabIndex={0}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="sr-only"
              accept=".pdf,.doc,.docx"
              multiple
              onChange={(e) => {
                const names = e.target.files ? Array.from(e.target.files).map((f) => f.name) : [];
                if (names.length) setPolicyFiles((prev) => [...prev, ...names]);
              }}
            />
            <p className="font-mono text-sm text-syntax-string">Drop policy documents here or click to browse</p>
            <p className="text-xs text-text-muted">PDF, DOC, DOCX</p>
            {policyFiles.length > 0 ? (
              <ul className="mt-2 w-full max-w-md text-left text-xs text-text-secondary">
                {policyFiles.map((n) => (
                  <li key={n} className="truncate font-mono">
                    {n}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <Card className="border-border-default bg-bg-editor">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-syntax-param">Suggested templates</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2 pt-0">
              {POLICY_TEMPLATES.map((t) => (
                <Badge key={t} variant="default" className="font-normal normal-case tracking-normal text-text-secondary">
                  {t}
                </Badge>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {step === 3 && (
        <Card className="border-border-default bg-bg-editor">
          <CardHeader>
            <CardTitle className="text-syntax-decorator">Configure trust center</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="mb-2 font-mono text-[0.65rem] font-semibold uppercase tracking-wider text-text-muted">
                Logo
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setLogoName("nimbus-logo.svg")}
                >
                  Upload logo
                </Button>
                {logoName ? (
                  <span className="font-mono text-xs text-syntax-string">{logoName}</span>
                ) : (
                  <span className="text-xs text-text-muted">No file selected</span>
                )}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="primary"
                  className="mb-1.5 block font-mono text-[0.65rem] font-semibold uppercase tracking-wider text-text-muted"
                >
                  Primary color
                </label>
                <div className="flex gap-2">
                  <input
                    id="primary"
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-10 w-14 cursor-pointer rounded border border-border-default bg-bg-input"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="accent"
                  className="mb-1.5 block font-mono text-[0.65rem] font-semibold uppercase tracking-wider text-text-muted"
                >
                  Accent color
                </label>
                <div className="flex gap-2">
                  <input
                    id="accent"
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="h-10 w-14 cursor-pointer rounded border border-border-default bg-bg-input"
                  />
                  <Input
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>
              </div>
            </div>
            <div>
              <label
                htmlFor="domain"
                className="mb-1.5 block font-mono text-[0.65rem] font-semibold uppercase tracking-wider text-text-muted"
              >
                Custom domain
              </label>
              <Input
                id="domain"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="trust.yourcompany.com"
                className="font-mono text-xs"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card className="border-border-default bg-bg-editor">
          <CardHeader>
            <CardTitle className="text-syntax-function">Invite team</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-1.5">
                <label
                  htmlFor="invite-email"
                  className="font-mono text-[0.65rem] font-semibold uppercase tracking-wider text-text-muted"
                >
                  Email
                </label>
                <Input
                  id="invite-email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="teammate@company.com"
                  className="font-mono text-xs"
                />
              </div>
              <div className="w-full space-y-1.5 sm:w-40">
                <label
                  htmlFor="invite-role"
                  className="font-mono text-[0.65rem] font-semibold uppercase tracking-wider text-text-muted"
                >
                  Role
                </label>
                <select
                  id="invite-role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as (typeof ROLE_OPTIONS)[number])}
                  className="flex h-8 w-full rounded-lg border border-border-default bg-bg-input px-2 font-mono text-xs text-text-primary focus:border-border-active focus:outline-none focus:ring-1 focus:ring-syntax-param/40"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r} className="bg-bg-editor">
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="button" onClick={addInvite}>
                Add
              </Button>
            </div>
            <ul className="divide-y divide-border-default rounded-lg border border-border-default bg-bg-input/40">
              {invited.map((row) => (
                <li key={row.email} className="flex items-center justify-between gap-2 px-3 py-2.5 text-sm">
                  <span className="truncate text-text-primary">{row.email}</span>
                  <Badge variant="info">{row.role}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {step === 5 && (
        <Card className="border-2 border-accent-green/35 bg-bg-card">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xl" aria-hidden>
                🎉
              </span>
              <CardTitle className="text-accent-green">You&apos;re ready to go</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-sm text-text-secondary">
              Trust Copilot is configured for {COMPANY}. Jump into the dashboard to finish connecting data
              and publish your trust center.
            </p>
            <div>
              <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-wider text-text-muted">
                Checklist
              </p>
              <ul className="mt-2 space-y-1.5 text-sm text-text-secondary">
                <li className="flex gap-2">
                  <span className="text-accent-green">✓</span> Workspace created
                </li>
                <li className="flex gap-2">
                  <span className="text-accent-green">✓</span> Branding saved
                </li>
                <li className="flex gap-2">
                  <span className="text-accent-yellow">○</span> Finish integrations (optional)
                </li>
              </ul>
            </div>
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/app">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-3 border-t border-border-default pt-4">
        <Button type="button" variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          Previous
        </Button>
        <Button
          type="button"
          onClick={() => setStep((s) => Math.min(totalSteps - 1, s + 1))}
          disabled={step === totalSteps - 1}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
