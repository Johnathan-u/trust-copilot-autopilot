"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const COMPANY_NAME = "Nimbus Security";
const VALID_UNTIL = "April 30, 2025";

const tiers = [
  {
    id: "starter",
    name: "Starter",
    price: "$299",
    period: "/mo",
    description: "For teams publishing a Trust Center and first questionnaires.",
    features: [
      "Trust Center hosting + branding",
      "Up to 3 active questionnaires",
      "SOC 2 control mapping templates",
      "Weekly digest email",
      "Slack alerts (1 channel)",
      "Email support",
    ],
    cta: "Choose Starter",
    recommended: false,
    enterprise: false,
  },
  {
    id: "professional",
    name: "Professional",
    price: "$599",
    period: "/mo",
    description: "For security and GTM teams running continuous diligence.",
    features: [
      "Everything in Starter",
      "Unlimited questionnaires & RFP slots",
      "Vendor security reviews (25/yr)",
      "Proof pack & magic links",
      "CRM sync and account timelines",
      "Priority chat support",
      "Custom trust metrics dashboard",
    ],
    cta: "Choose Professional",
    recommended: true,
    enterprise: false,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For regulated industries and multi-entity programs.",
    features: [
      "Dedicated CSM & quarterly business reviews",
      "HIPAA / ISO program playbooks",
      "SSO (SAML) + SCIM provisioning",
      "Private VPC or single-tenant options",
      "API access & audit log export",
      "24/7 phone escalation",
      "Custom MSA & DPA",
    ],
    cta: "Contact Sales",
    recommended: false,
    enterprise: true,
  },
] as const;

const whatsIncluded = [
  {
    title: "Automated Compliance",
    body: "Map controls to evidence automatically and surface gaps before auditors do.",
  },
  {
    title: "Trust Center",
    body: "A single source of truth buyers trust—policies, subprocessors, and certifications.",
  },
  {
    title: "Vendor Reviews",
    body: "Structured security reviews with scoring, renewal reminders, and exportable summaries.",
  },
  {
    title: "Continuous Monitoring",
    body: "Signals from your stack and vendors keep the narrative accurate between audits.",
  },
];

export default function OfferPage() {
  const params = useParams<{ offerId: string }>();
  const offerId = params.offerId;

  return (
    <div className="min-h-screen bg-bg-root px-4 py-12 font-sans sm:px-6 md:py-16">
      <div className="mx-auto max-w-6xl">
        <header className="mb-12 text-center">
          <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-syntax-keyword">
            Trust Copilot
          </p>
          <h1 className="mt-3 font-mono text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
            Custom offer for {COMPANY_NAME}
          </h1>
          <p className="mt-3 max-w-xl mx-auto text-sm text-text-secondary">
            Pick the tier that matches your diligence volume. You can adjust seats and add-ons at
            checkout.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          {tiers.map((tier) => (
            <Card
              key={tier.id}
              className={cn(
                "relative flex flex-col border-border-default bg-bg-editor transition-colors",
                tier.recommended &&
                  "border-2 border-border-active shadow-[0_0_24px_rgba(61,61,92,0.35)] lg:scale-[1.02]"
              )}
            >
              {tier.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="info">Recommended</Badge>
                </div>
              )}
              <CardHeader className="flex flex-col items-start gap-1 border-border-default pb-4">
                <CardTitle className="text-syntax-class">{tier.name}</CardTitle>
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-3xl font-semibold text-text-primary">
                    {tier.price}
                  </span>
                  {tier.period ? (
                    <span className="font-mono text-sm text-text-secondary">{tier.period}</span>
                  ) : null}
                </div>
                <p className="text-sm text-text-secondary">{tier.description}</p>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-6 pt-0">
                <ul className="space-y-2.5 text-sm text-text-secondary">
                  {tier.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <span className="font-mono text-accent-green">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                {tier.enterprise ? (
                  <Button variant="outline" size="lg" className="mt-auto h-11 w-full" asChild>
                    <a href="mailto:sales@trustcopilot.com">{tier.cta}</a>
                  </Button>
                ) : (
                  <Button size="lg" className="mt-auto h-11 w-full" asChild>
                    <Link href={`/checkout/${offerId}?plan=${tier.id}`}>{tier.cta}</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <section className="mt-16">
          <h2 className="mb-6 text-center font-mono text-sm font-semibold uppercase tracking-wider text-syntax-builtin">
            What&apos;s Included
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {whatsIncluded.map((block) => (
              <Card
                key={block.title}
                className="border-border-default bg-bg-card hover:bg-bg-card-hover"
              >
                <CardHeader className="border-0 pb-2">
                  <CardTitle className="text-sm text-syntax-param">{block.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm leading-relaxed text-text-secondary">{block.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <p className="mt-12 text-center font-mono text-[0.65rem] text-text-muted">
          Valid until {VALID_UNTIL} · Offer ref{" "}
          <span className="text-syntax-string">{offerId}</span>
        </p>
      </div>
    </div>
  );
}
