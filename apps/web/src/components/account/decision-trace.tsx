"use client";

import type { ReactNode } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StepStatus = "pass" | "fail" | "borderline";

function stepBorderClass(status: StepStatus) {
  switch (status) {
    case "pass":
      return "border-accent-green/40 shadow-[0_0_0_1px_rgba(0,0,0,0)] shadow-accent-green/15";
    case "fail":
      return "border-accent-red/50 shadow-[0_0_0_1px_rgba(0,0,0,0)] shadow-accent-red/10";
    case "borderline":
      return "border-accent-yellow/50 shadow-[0_0_0_1px_rgba(0,0,0,0)] shadow-accent-yellow/10";
  }
}

function StatusBadge({ status }: { status: StepStatus }) {
  if (status === "pass") {
    return (
      <Badge variant="success" className="normal-case tracking-normal">
        Pass
      </Badge>
    );
  }
  if (status === "fail") {
    return (
      <Badge variant="p0" className="normal-case tracking-normal">
        Fail
      </Badge>
    );
  }
  return (
    <Badge variant="p1" className="normal-case tracking-normal">
      Borderline
    </Badge>
  );
}

function MetaRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1 sm:grid-cols-[5.5rem_1fr] sm:items-start">
      <span className="font-mono text-[0.65rem] uppercase tracking-wider text-text-muted">
        {label}
      </span>
      <div className="min-w-0 text-sm text-text-primary">{children}</div>
    </div>
  );
}

function VersionPills({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5 pt-1">
      {items.map((v) => (
        <span
          key={v}
          className="font-mono text-[0.6rem] text-syntax-decorator border border-border-default rounded px-1.5 py-0.5 bg-bg-input"
        >
          {v}
        </span>
      ))}
    </div>
  );
}

export function DecisionTrace() {
  return (
    <div className="flex flex-col gap-0 bg-bg-root rounded-xl p-4">
      <div className="mb-4">
        <h2 className="font-mono text-sm font-semibold text-text-primary">
          Decision trace
        </h2>
        <p className="mt-1 text-xs text-text-secondary">
          Intermediate scoring steps for the latest contact recommendation.
        </p>
      </div>

      <ol className="relative flex flex-col gap-0">
        {/* connector line */}
        <div
          className="absolute left-[1.125rem] top-6 bottom-6 w-px bg-border-default hidden sm:block"
          aria-hidden
        />

        <li className="relative z-[1] pb-3">
          <Card
            className={cn(
              "bg-bg-card border-border-default",
              stepBorderClass("pass")
            )}
          >
            <CardHeader className="flex-row flex-wrap items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border-default bg-bg-input font-mono text-[0.65rem] text-syntax-number">
                1
              </span>
              <CardTitle className="text-syntax-keyword">Signal fusion</CardTitle>
              <StatusBadge status="pass" />
            </CardHeader>
            <CardContent className="space-y-3">
              <MetaRow label="Inputs">
                <span className="font-mono text-syntax-string">
                  crawl_v3, enrichment_bundle, technographic_hints
                </span>
              </MetaRow>
              <MetaRow label="Outputs">
                <div className="space-y-1">
                  <p>
                    <span className="text-text-muted">Fused score:</span>{" "}
                    <span className="font-mono text-syntax-number">0.78</span>
                  </p>
                  <ul className="list-inside list-disc text-text-secondary text-xs">
                    <li>
                      <span className="text-syntax-class">security_page</span>{" "}
                      — weight{" "}
                      <span className="font-mono text-syntax-number">0.24</span>
                    </li>
                    <li>
                      <span className="text-syntax-class">job_signals</span>{" "}
                      — weight{" "}
                      <span className="font-mono text-syntax-number">0.31</span>
                    </li>
                    <li>
                      <span className="text-syntax-class">vendor_mentions</span>{" "}
                      — weight{" "}
                      <span className="font-mono text-syntax-number">0.23</span>
                    </li>
                  </ul>
                </div>
              </MetaRow>
              <div>
                <span className="font-mono text-[0.65rem] uppercase tracking-wider text-text-muted">
                  Versions
                </span>
                <VersionPills items={["rules_v1.2", "fusion_model_v0.9"]} />
              </div>
            </CardContent>
          </Card>
        </li>

        <li className="relative z-[1] pb-3">
          <Card
            className={cn(
              "bg-bg-card border-border-default",
              stepBorderClass("pass")
            )}
          >
            <CardHeader className="flex-row flex-wrap items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border-default bg-bg-input font-mono text-[0.65rem] text-syntax-number">
                2
              </span>
              <CardTitle className="text-syntax-keyword">ICP scoring</CardTitle>
              <StatusBadge status="pass" />
            </CardHeader>
            <CardContent className="space-y-3">
              <MetaRow label="Inputs">
                <span className="text-text-secondary">
                  Firmographics, industry map, employee band, geo
                </span>
              </MetaRow>
              <MetaRow label="Outputs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-text-muted">Score</span>
                  <span className="font-mono text-lg text-syntax-number">82</span>
                  <span className="text-text-muted">/</span>
                  <span className="font-mono text-text-secondary">threshold 70</span>
                  <Badge variant="success" className="normal-case tracking-normal">
                    Above threshold
                  </Badge>
                </div>
              </MetaRow>
              <div>
                <span className="font-mono text-[0.65rem] uppercase tracking-wider text-text-muted">
                  Versions
                </span>
                <VersionPills items={["icp_rules_v2.0", "taxonomy_v1"]} />
              </div>
            </CardContent>
          </Card>
        </li>

        <li className="relative z-[1] pb-3">
          <Card
            className={cn(
              "bg-bg-card border-border-default",
              stepBorderClass("pass")
            )}
          >
            <CardHeader className="flex-row flex-wrap items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border-default bg-bg-input font-mono text-[0.65rem] text-syntax-number">
                3
              </span>
              <CardTitle className="text-syntax-keyword">Pain inference</CardTitle>
              <StatusBadge status="pass" />
            </CardHeader>
            <CardContent className="space-y-3">
              <MetaRow label="Inputs">
                <span className="text-syntax-param">
                  Page copy, job reqs, stack hints, compliance tokens
                </span>
              </MetaRow>
              <MetaRow label="Outputs">
                <div className="space-y-1">
                  <p>
                    <span className="text-text-muted">Pain type:</span>{" "}
                    <span className="font-mono text-syntax-function">
                      SOC2_readiness_gap
                    </span>
                  </p>
                  <p>
                    <span className="text-text-muted">Severity score:</span>{" "}
                    <span className="font-mono text-syntax-number">72</span>
                  </p>
                </div>
              </MetaRow>
              <div>
                <span className="font-mono text-[0.65rem] uppercase tracking-wider text-text-muted">
                  Versions
                </span>
                <VersionPills items={["pain_taxonomy_v1", "classifier_v0.4"]} />
              </div>
            </CardContent>
          </Card>
        </li>

        <li className="relative z-[1] pb-3">
          <Card
            className={cn(
              "bg-bg-card border-border-default",
              stepBorderClass("borderline")
            )}
          >
            <CardHeader className="flex-row flex-wrap items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border-default bg-bg-input font-mono text-[0.65rem] text-syntax-number">
                4
              </span>
              <CardTitle className="text-syntax-keyword">Urgency check</CardTitle>
              <StatusBadge status="borderline" />
            </CardHeader>
            <CardContent className="space-y-3">
              <MetaRow label="Inputs">
                <span className="text-text-secondary">
                  Hiring velocity, policy mentions, renewal windows (inferred)
                </span>
              </MetaRow>
              <MetaRow label="Outputs">
                <div className="space-y-1">
                  <p>
                    <span className="text-text-muted">Urgency score:</span>{" "}
                    <span className="font-mono text-accent-yellow">58</span>
                  </p>
                  <p>
                    <span className="text-text-muted">Why-now score:</span>{" "}
                    <span className="font-mono text-accent-yellow">61</span>
                  </p>
                  <p className="text-xs text-text-muted">
                    Within borderline band (55–65); still eligible for contact
                    under policy override{" "}
                    <span className="font-mono text-syntax-builtin">urgency_lenient</span>
                    .
                  </p>
                </div>
              </MetaRow>
              <div>
                <span className="font-mono text-[0.65rem] uppercase tracking-wider text-text-muted">
                  Versions
                </span>
                <VersionPills items={["urgency_rules_v1.1", "taxonomy_v1"]} />
              </div>
            </CardContent>
          </Card>
        </li>

        <li className="relative z-[1] pb-3">
          <Card
            className={cn(
              "bg-bg-card border-border-default",
              stepBorderClass("pass")
            )}
          >
            <CardHeader className="flex-row flex-wrap items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border-default bg-bg-input font-mono text-[0.65rem] text-syntax-number">
                5
              </span>
              <CardTitle className="text-syntax-keyword">Deal value</CardTitle>
              <StatusBadge status="pass" />
            </CardHeader>
            <CardContent className="space-y-3">
              <MetaRow label="Inputs">
                <span className="text-text-secondary">
                  Seat estimate, ACV priors, segment tier table
                </span>
              </MetaRow>
              <MetaRow label="Outputs">
                <div className="space-y-1">
                  <p>
                    <span className="text-text-muted">Expected value:</span>{" "}
                    <span className="font-mono text-syntax-number">$48,000</span>{" "}
                    <span className="text-text-muted">ARR (p50)</span>
                  </p>
                  <p>
                    <span className="text-text-muted">Tier:</span>{" "}
                    <span className="font-mono text-syntax-class">SMB_PLUS</span>
                  </p>
                </div>
              </MetaRow>
              <div>
                <span className="font-mono text-[0.65rem] uppercase tracking-wider text-text-muted">
                  Versions
                </span>
                <VersionPills items={["pricing_table_v3", "rules_v1.2"]} />
              </div>
            </CardContent>
          </Card>
        </li>

        <li className="relative z-[1] pb-3">
          <Card
            className={cn(
              "bg-bg-card border-border-default",
              stepBorderClass("pass")
            )}
          >
            <CardHeader className="flex-row flex-wrap items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border-default bg-bg-input font-mono text-[0.65rem] text-syntax-number">
                6
              </span>
              <CardTitle className="text-syntax-keyword">Buyer resolution</CardTitle>
              <StatusBadge status="pass" />
            </CardHeader>
            <CardContent className="space-y-3">
              <MetaRow label="Inputs">
                <span className="text-syntax-string">
                  Leadership page, email patterns, press bylines
                </span>
              </MetaRow>
              <MetaRow label="Outputs">
                <div className="space-y-1">
                  <p>
                    <span className="text-text-muted">Primary buyer:</span>{" "}
                    <span className="font-mono text-syntax-function">
                      VP Engineering
                    </span>
                  </p>
                  <p>
                    <span className="text-text-muted">Confidence:</span>{" "}
                    <span className="font-mono text-syntax-number">0.84</span>
                  </p>
                </div>
              </MetaRow>
              <div>
                <span className="font-mono text-[0.65rem] uppercase tracking-wider text-text-muted">
                  Versions
                </span>
                <VersionPills items={["buyer_graph_v0.7", "taxonomy_v1"]} />
              </div>
            </CardContent>
          </Card>
        </li>

        <li className="relative z-[1]">
          <Card
            className={cn(
              "bg-bg-card border-border-default",
              stepBorderClass("pass")
            )}
          >
            <CardHeader className="flex-row flex-wrap items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border-default bg-bg-input font-mono text-[0.65rem] text-syntax-number">
                7
              </span>
              <CardTitle className="text-syntax-keyword">Contact decision</CardTitle>
              <Badge variant="contact" className="normal-case tracking-normal">
                CONTACT
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <MetaRow label="Inputs">
                <span className="text-text-secondary">
                  Aggregated step scores, policy gates, suppression lists
                </span>
              </MetaRow>
              <MetaRow label="Outputs">
                <p className="text-sm text-text-primary leading-relaxed">
                  <span className="font-mono text-accent-green">CONTACT</span>
                  {" — "}
                  ICP and pain gates passed; urgency is borderline but allowed by{" "}
                  <span className="font-mono text-syntax-builtin">
                    urgency_lenient
                  </span>
                  . Deal value meets{" "}
                  <span className="font-mono text-syntax-class">SMB_PLUS</span>{" "}
                  minimum. Primary buyer resolved with high confidence; no
                  hard-negative competitors on record for this account snapshot.
                </p>
              </MetaRow>
              <div>
                <span className="font-mono text-[0.65rem] uppercase tracking-wider text-text-muted">
                  Versions
                </span>
                <VersionPills
                  items={["decision_policy_v2.3", "rules_v1.2", "taxonomy_v1"]}
                />
              </div>
            </CardContent>
          </Card>
        </li>
      </ol>

      <div className="mt-4 flex justify-end border-t border-border-default pt-4">
        <Button type="button" variant="outline">
          Replay decision
        </Button>
      </div>
    </div>
  );
}
