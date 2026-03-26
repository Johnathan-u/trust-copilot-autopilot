"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const COMPANY_NAME = "Nimbus Security";

const FEATURES = [
  "SOC 2 automation",
  "Trust center",
  "Vendor reviews",
  "Policy templates",
  "Continuous monitoring",
  "Compliance dashboard",
  "Priority support",
  "Dedicated CSM",
] as const;

const ROI_BREAKDOWN = [
  { label: "Audit prep", hours: "80h" },
  { label: "Vendor reviews", hours: "60h" },
  { label: "Policy management", hours: "40h" },
  { label: "Evidence collection", hours: "20h+" },
] as const;

function formatExpiryDate(d: Date) {
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function OfferPage() {
  const params = useParams<{ offerId: string }>();
  const offerId = params.offerId;

  const offerEndsAt = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d;
  }, []);

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  const msLeft = Math.max(0, offerEndsAt.getTime() - now);
  const daysLeft = Math.floor(msLeft / (24 * 60 * 60 * 1000));
  const hoursLeft = Math.floor((msLeft % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

  return (
    <div className="min-h-screen bg-bg-root px-4 py-12 font-sans sm:px-6 md:py-16">
      <div className="mx-auto max-w-2xl">
        <header className="mb-10 text-center">
          <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-syntax-keyword">
            Trust Copilot
          </p>
          <h1 className="mt-4 font-mono text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
            Exclusive offer for {COMPANY_NAME}
          </h1>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <Badge variant="info" className="font-mono text-[0.65rem] uppercase tracking-wider">
              Offer ID · {offerId}
            </Badge>
            <Badge variant="qualification" className="font-mono text-[0.65rem] uppercase tracking-wider">
              Expires {formatExpiryDate(offerEndsAt)}
            </Badge>
          </div>
        </header>

        <Card className="relative overflow-hidden border-2 border-border-active bg-bg-editor shadow-[0_0_32px_rgba(61,61,92,0.25)]">
          <div className="absolute right-4 top-4">
            <Badge variant="success" className="font-mono text-[0.6rem] uppercase tracking-wider">
              Money-back guarantee
            </Badge>
          </div>
          <CardHeader className="border-border-default pb-4 pt-12 sm:pt-4">
            <CardTitle className="font-mono text-xl text-syntax-class sm:text-2xl">
              Professional Trust Platform
            </CardTitle>
            <div className="mt-3 flex flex-wrap items-baseline gap-2">
              <span className="font-mono text-3xl font-semibold text-text-primary">$499</span>
              <span className="font-mono text-sm text-text-secondary">/mo</span>
              <span className="font-mono text-sm text-text-muted line-through decoration-text-muted/80">
                $599/mo
              </span>
              <Badge variant="route" className="font-mono text-[0.65rem]">
                Save $100/mo
              </Badge>
            </div>
            <p className="mt-2 text-sm text-text-secondary">
              Everything you need to automate SOC 2, run your trust center, and close security reviews
              faster—at a fixed price for your team.
            </p>
          </CardHeader>
          <CardContent className="space-y-8 pt-0">
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-text-secondary">
                  <span className="font-mono text-accent-green" aria-hidden>
                    ✓
                  </span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <div className="rounded-xl border border-border-default bg-bg-card px-4 py-5">
              <p className="font-mono text-xs font-semibold uppercase tracking-wider text-syntax-builtin">
                Estimated time savings
              </p>
              <p className="mt-2 font-mono text-lg font-semibold text-syntax-param">
                200+ hours/year
              </p>
              <ul className="mt-4 space-y-2 border-t border-border-default pt-4 text-sm text-text-secondary">
                {ROI_BREAKDOWN.map((row) => (
                  <li key={row.label} className="flex justify-between gap-4">
                    <span>{row.label}</span>
                    <span className="font-mono text-syntax-string tabular-nums">{row.hours}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-dashed border-border-default bg-bg-input/50 px-4 py-6 text-center">
              <p className="font-mono text-xs font-semibold uppercase tracking-wider text-text-muted">
                Trusted by 200+ companies
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
                {["Acme Corp", "Northwind", "Contoso"].map((name) => (
                  <div
                    key={name}
                    className="flex h-12 w-28 items-center justify-center rounded-lg border border-border-default bg-bg-card font-mono text-[0.6rem] font-semibold uppercase tracking-wider text-text-muted"
                  >
                    {name}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Button size="lg" className="h-12 w-full font-mono text-sm" asChild>
                <Link href={`/checkout/${offerId}`}>Claim Your Offer</Link>
              </Button>
              <p className="text-center font-mono text-xs text-syntax-keyword">
                Valid for{" "}
                <span className="text-syntax-string">
                  {daysLeft}d {hoursLeft}h
                </span>{" "}
                remaining
              </p>
              <p className="text-center text-xs text-text-muted">
                <Link
                  href="/terms"
                  className="text-syntax-param underline-offset-2 hover:underline"
                >
                  Terms &amp; conditions
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
