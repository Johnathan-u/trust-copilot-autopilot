"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type CompetitorFinding = {
  name: string;
  detail: string;
  impact: "low" | "medium" | "high";
};

export type NegativeSignalFinding = {
  label: string;
  detail: string;
};

const MOCK_COMPETITORS: CompetitorFinding[] = [
  {
    name: "Vanta",
    detail: "Mentioned on /security page",
    impact: "medium",
  },
  {
    name: "Drata",
    detail: "Job posting for Drata admin",
    impact: "high",
  },
];

const MOCK_NEGATIVES: NegativeSignalFinding[] = [
  {
    label: "Enterprise-too-big",
    detail: "5000+ employees estimated",
  },
  {
    label: "Already-solved",
    detail: "Existing trust center detected",
  },
];

function ImpactBadge({ impact }: { impact: CompetitorFinding["impact"] }) {
  const variant =
    impact === "high" ? "p0" : impact === "medium" ? "p1" : "success";
  return (
    <Badge variant={variant} className="normal-case tracking-normal shrink-0">
      {impact}
    </Badge>
  );
}

export type CompetitorWidgetProps = {
  /** When both lists are empty, shows the green “no blockers” state. */
  competitors?: CompetitorFinding[];
  negativeSignals?: NegativeSignalFinding[];
};

export function CompetitorWidget({
  competitors = MOCK_COMPETITORS,
  negativeSignals = MOCK_NEGATIVES,
}: CompetitorWidgetProps) {
  const hasCompetitors = competitors.length > 0;
  const hasNegatives = negativeSignals.length > 0;
  const noBlockers = !hasCompetitors && !hasNegatives;

  return (
    <Card className="bg-bg-card border-border-default">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-xs font-semibold text-text-primary">
          Competitors & risk
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-4 pb-4 pt-0">
        {noBlockers ? (
          <div
            className={cn(
              "flex items-start gap-2 rounded-lg border border-accent-green/30",
              "bg-accent-green-dim/30 px-3 py-2.5"
            )}
          >
            <CheckCircle2
              className="mt-0.5 size-4 shrink-0 text-accent-green"
              aria-hidden
            />
            <p className="font-mono text-xs text-accent-green leading-snug">
              No blockers detected
            </p>
          </div>
        ) : (
          <>
            <section>
              <h4 className="mb-2 font-mono text-[0.65rem] uppercase tracking-wider text-text-muted">
                Competitor Presence
              </h4>
              {hasCompetitors ? (
                <ul className="space-y-2">
                  {competitors.map((c) => (
                    <li
                      key={`${c.name}-${c.detail}`}
                      className="rounded-md border border-border-default bg-bg-input px-2.5 py-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="font-mono text-xs font-medium text-syntax-class">
                            {c.name}
                          </span>
                          <span className="text-text-muted"> — </span>
                          <span className="text-xs text-text-secondary">
                            {c.detail}
                          </span>
                        </div>
                        <ImpactBadge impact={c.impact} />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-text-muted">None detected.</p>
              )}
            </section>

            <section>
              <h4 className="mb-2 font-mono text-[0.65rem] uppercase tracking-wider text-text-muted">
                Negative Signals
              </h4>
              {hasNegatives ? (
                <ul className="space-y-2">
                  {negativeSignals.map((n) => (
                    <li
                      key={`${n.label}-${n.detail}`}
                      className="flex gap-2 rounded-md border border-border-default bg-bg-input px-2.5 py-2"
                    >
                      <AlertTriangle
                        className="mt-0.5 size-3.5 shrink-0 text-accent-red"
                        aria-hidden
                      />
                      <div className="min-w-0">
                        <span className="font-mono text-xs text-syntax-keyword">
                          {n.label}
                        </span>
                        <span className="text-text-muted">: </span>
                        <span className="text-xs text-text-secondary">
                          {n.detail}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-text-muted">None detected.</p>
              )}
            </section>
          </>
        )}
      </CardContent>
    </Card>
  );
}
