"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MOCK_EMAIL = "alex.morgan@example.com";

type PrefRowProps = {
  title: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
};

function PrefSwitch({
  title,
  description,
  checked,
  onToggle,
  disabled,
}: PrefRowProps) {
  return (
    <div
      className={cn(
        "flex gap-4 rounded-lg border border-border-default bg-bg-editor px-4 py-3",
        disabled && "opacity-50"
      )}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={onToggle}
        className="mt-0.5 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-syntax-param/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-root disabled:pointer-events-none"
      >
        <div
          className={cn(
            "relative h-6 w-11 rounded-full border border-border-default transition-colors",
            checked ? "bg-syntax-class/25 border-syntax-class/40" : "bg-bg-input"
          )}
        >
          <div
            className={cn(
              "absolute top-0.5 size-5 rounded-full bg-text-primary/90 shadow-sm transition-transform",
              checked ? "left-[22px]" : "left-0.5"
            )}
          />
        </div>
      </button>
      <div className="min-w-0 text-left">
        <p className="font-mono text-sm font-medium text-text-primary">
          {title}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-text-secondary">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function TrustCopilotEmailPreferencesPage() {
  const params = useParams<{ token: string }>();
  const token = typeof params.token === "string" ? params.token : "";

  const [productUpdates, setProductUpdates] = useState(true);
  const [securityInsights, setSecurityInsights] = useState(true);
  const [partnership, setPartnership] = useState(false);
  const [unsubscribeAll, setUnsubscribeAll] = useState(false);
  const [saved, setSaved] = useState(false);

  const prefsDisabled = unsubscribeAll;

  function toggleUnsubscribeAll(next: boolean) {
    setSaved(false);
    setUnsubscribeAll(next);
    if (next) {
      setProductUpdates(false);
      setSecurityInsights(false);
      setPartnership(false);
    }
  }

  function handleSave() {
    setSaved(true);
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg-root font-sans">
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          <p className="text-center font-mono text-sm font-semibold tracking-tight text-text-primary">
            Trust Copilot
          </p>
          <p className="mt-1 text-center text-xs text-text-muted">
            Preference center
          </p>

          <Card className="mt-10 border-border-default bg-bg-card">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-text-primary">
                  Email preferences for{" "}
                  <span className="text-syntax-string">{MOCK_EMAIL}</span>
                </CardTitle>
                <Badge variant="info">Marketing</Badge>
              </div>
              {token ? (
                <p className="mt-2 font-mono text-xs text-text-muted">
                  Reference: {token}
                </p>
              ) : null}
            </CardHeader>
            <CardContent className="space-y-4">
              <PrefSwitch
                title="Product Updates"
                description="Release notes, feature announcements, and product education tailored to your workspace."
                checked={productUpdates}
                disabled={prefsDisabled}
                onToggle={() => {
                  setSaved(false);
                  setUnsubscribeAll(false);
                  setProductUpdates((v) => !v);
                }}
              />
              <PrefSwitch
                title="Security Insights"
                description="Threat summaries, compliance tips, and security program updates from Trust Copilot."
                checked={securityInsights}
                disabled={prefsDisabled}
                onToggle={() => {
                  setSaved(false);
                  setUnsubscribeAll(false);
                  setSecurityInsights((v) => !v);
                }}
              />
              <PrefSwitch
                title="Partnership Opportunities"
                description="Invitations to programs, co-marketing, and ecosystem partnerships where relevant."
                checked={partnership}
                disabled={prefsDisabled}
                onToggle={() => {
                  setSaved(false);
                  setUnsubscribeAll(false);
                  setPartnership((v) => !v);
                }}
              />

              <div
                className={cn(
                  "rounded-lg border px-4 py-3",
                  "border-accent-red/35 bg-accent-red/[0.08]"
                )}
              >
                <div className="flex gap-4">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={unsubscribeAll}
                    onClick={() => toggleUnsubscribeAll(!unsubscribeAll)}
                    className="mt-0.5 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-red/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-root"
                  >
                    <div
                      className={cn(
                        "relative h-6 w-11 rounded-full border transition-colors",
                        unsubscribeAll
                          ? "border-accent-red/50 bg-accent-red/20"
                          : "border-border-default bg-bg-input"
                      )}
                    >
                      <div
                        className={cn(
                          "absolute top-0.5 size-5 rounded-full bg-accent-red shadow-sm transition-transform",
                          unsubscribeAll ? "left-[22px]" : "left-0.5"
                        )}
                      />
                    </div>
                  </button>
                  <div>
                    <p className="font-mono text-sm font-medium text-accent-red">
                      Unsubscribe from all
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                      Stop all marketing and newsletter email from this sender.
                      Transactional messages may still apply.
                    </p>
                  </div>
                </div>
              </div>

              {saved && (
                <p
                  className="rounded-lg border border-accent-green/30 bg-accent-green-dim/50 px-4 py-3 text-sm text-accent-green"
                  role="status"
                >
                  Your preferences have been updated
                </p>
              )}

              <Button
                type="button"
                size="lg"
                className="w-full"
                onClick={handleSave}
              >
                Save preferences
              </Button>
            </CardContent>
          </Card>

          <p className="mt-10 text-center text-xs text-text-muted">
            Powered by{" "}
            <Link
              href="/"
              className="font-mono text-syntax-keyword underline decoration-border-default underline-offset-4 hover:text-syntax-param"
            >
              Trust Copilot
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
