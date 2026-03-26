"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const COMPANY_NAME = "Nimbus Security";

const stats = [
  { label: "Trust Score", value: "78", accent: "text-syntax-param" as const },
  { label: "Documents Analyzed", value: "4", accent: "text-syntax-class" as const },
  { label: "Gaps Found", value: "2", accent: "text-accent-yellow" as const },
  { label: "Time to Remediate", value: "~45 days", accent: "text-syntax-string" as const },
];

const testimonials = [
  {
    quote: "Cut our security questionnaire cycle in half.",
    author: "VP Eng",
    company: "Series B SaaS",
  },
  {
    quote: "Finally one place buyers trust — without the spreadsheet chaos.",
    author: "Head of IT",
    company: "Fintech",
  },
  {
    quote: "Audit-ready narratives without hiring another GRC headcount.",
    author: "CISO",
    company: "Healthtech",
  },
];

export default function ProofPackSummaryLandingPage() {
  const params = useParams<{ token: string }>();
  const token = typeof params.token === "string" ? params.token : "";
  const proofHref = token ? `/proof/${token}` : "/proof";

  return (
    <div className="min-h-screen bg-bg-root px-4 py-12 font-sans sm:px-6 md:py-16">
      <div className="mx-auto max-w-lg">
        <header className="text-center">
          <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-syntax-keyword">
            Trust Copilot
          </p>
          <h1 className="mt-6 font-mono text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
            Your proof pack is ready
          </h1>
          <div className="mt-4 flex justify-center">
            <Badge variant="tech" className="normal-case tracking-normal text-sm">
              {COMPANY_NAME}
            </Badge>
          </div>
          {token ? (
            <p className="mt-3 font-mono text-[0.6rem] text-text-muted">
              Delivery ID: <span className="text-syntax-string">{token}</span>
            </p>
          ) : null}
        </header>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-2">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-lg border border-border-default bg-bg-card px-3 py-3 text-center"
            >
              <p className={cn("font-mono text-lg font-semibold sm:text-xl", s.accent)}>
                {s.value}
              </p>
              <p className="mt-1 text-[0.65rem] leading-snug text-text-secondary">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 space-y-3">
          <Card className="border-border-default bg-bg-card">
            <CardContent className="py-5">
              <p className="text-center text-xs text-text-muted">Primary</p>
              <Button asChild size="lg" className="mt-2 w-full">
                <Link href={proofHref}>View Full Report</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border-default bg-bg-editor">
            <CardContent className="py-5">
              <p className="text-center text-xs text-text-muted">Export</p>
              <Button type="button" variant="outline" size="lg" className="mt-2 w-full">
                Download PDF Summary
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border-default bg-bg-editor">
            <CardContent className="py-5">
              <p className="text-center text-xs text-text-muted">Expert help</p>
              <Button type="button" variant="outline" size="lg" className="mt-2 w-full">
                Schedule Expert Review
              </Button>
            </CardContent>
          </Card>
        </div>

        <section className="mt-14 border-t border-border-default pt-10">
          <p className="text-center font-mono text-sm font-semibold text-text-primary">
            Join 200+ companies using Trust Copilot
          </p>
          <ul className="mt-6 space-y-4">
            {testimonials.map((t, i) => (
              <li
                key={i}
                className="rounded-lg border border-border-default bg-bg-card px-4 py-3"
              >
                <p className="text-sm italic leading-relaxed text-text-secondary">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <p className="mt-2 font-mono text-[0.65rem] text-text-muted">
                  — {t.author}
                  {t.company ? (
                    <>
                      , <span className="text-text-secondary">{t.company}</span>
                    </>
                  ) : null}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <footer className="mt-14 border-t border-border-default pt-8 text-center">
          <p className="text-xs leading-relaxed text-text-muted">
            <span className="font-mono text-text-secondary">Security note:</span> This link is
            unique to your organization. Do not forward. Access may be logged for compliance.
          </p>
        </footer>
      </div>
    </div>
  );
}
