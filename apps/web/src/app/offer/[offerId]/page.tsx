"use client";

import { CreditCard } from "lucide-react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const INCLUDED = [
  "Trust Room access for your security team",
  "Questionnaire ingestion and gap analysis",
  "Proof pack generation and sharing links",
  "Email notifications at key milestones",
];

export default function FixedOfferPage() {
  const params = useParams<{ offerId: string }>();
  const offerId = params.offerId;

  return (
    <div className="min-h-screen bg-bg-root px-6 py-16 md:py-24">
      <div className="mx-auto flex max-w-md flex-col items-center">
        <div className="w-full rounded-2xl border border-border-default bg-bg-editor/80 p-10 md:p-11">
          <div className="mb-6 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-accent-blue-bright/30 bg-glow-blue text-accent-blue-bright">
              <CreditCard className="h-7 w-7" strokeWidth={1.5} aria-hidden />
            </div>
          </div>

          <p className="text-center font-mono text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-text-muted">
            Your offer
          </p>
          <h1 className="mt-2 text-center font-mono text-2xl font-semibold text-text-primary">
            Trust Copilot — Growth
          </h1>
          <p className="mt-1 text-center font-mono text-3xl font-semibold text-syntax-class">
            $—<span className="text-lg font-medium text-text-secondary">/mo</span>
          </p>
          <p className="mt-2 text-center text-sm text-text-secondary">
            Placeholder pricing. Final terms appear at checkout.
          </p>
          <p className="mt-1 text-center font-mono text-xs text-text-muted">
            Offer ID: {offerId}
          </p>

          <div className="mt-8 rounded-xl border border-border-default bg-bg-card/60 p-6">
            <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-wider text-syntax-builtin">
              What&apos;s included
            </p>
            <ul className="mt-4 space-y-3 text-sm text-text-secondary">
              {INCLUDED.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-0.5 shrink-0 font-mono text-accent-green">
                    •
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <Button asChild size="lg" className="mt-10 h-12 w-full text-sm">
            <Link href={`/checkout/${offerId}`}>Start checkout</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
