"use client";

import { type FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-lg border border-border-default bg-bg-input px-3 py-2.5 font-mono text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors focus:border-border-active focus:ring-1 focus:ring-syntax-param/40";

const PLAN_BY_ID: Record<
  string,
  { name: string; price: number; cycle: string; features: string[] }
> = {
  starter: {
    name: "Starter",
    price: 299,
    cycle: "Monthly",
    features: [
      "Trust Center + branding",
      "3 active questionnaires",
      "SOC 2 mapping templates",
      "Weekly digest",
    ],
  },
  professional: {
    name: "Professional",
    price: 599,
    cycle: "Monthly",
    features: [
      "Unlimited questionnaires",
      "25 vendor reviews / yr",
      "Proof packs & magic links",
      "CRM sync & timelines",
    ],
  },
};

function randomOrderId() {
  return `TC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export default function CheckoutPage() {
  const params = useParams<{ offerId: string }>();
  const searchParams = useSearchParams();
  const offerId = params.offerId;
  const planParam = searchParams.get("plan") ?? "professional";

  const plan = useMemo(() => {
    return PLAN_BY_ID[planParam] ?? PLAN_BY_ID.professional;
  }, [planParam]);

  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const subtotal = plan.price;
  const taxRate = 0.08;
  const tax = Math.round(subtotal * taxRate * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setOrderId(randomOrderId());
    setSuccess(true);
  }

  if (success && orderId) {
    return (
      <div className="min-h-screen bg-bg-root px-4 py-12 font-sans sm:px-6 md:py-16">
        <div className="mx-auto max-w-md">
          <p className="text-center font-mono text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-syntax-keyword">
            Trust Copilot
          </p>
          <Card className="mt-6 border-2 border-accent-green/40 bg-bg-editor">
            <CardHeader className="border-border-default">
              <div className="flex items-center gap-2">
                <Badge variant="success">Confirmed</Badge>
                <CardTitle className="text-accent-green">Purchase complete</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="font-mono text-sm text-text-secondary">
                Order number{" "}
                <span className="text-syntax-string">{orderId}</span>
              </p>
              <p className="text-lg font-medium text-text-primary">Welcome to Trust Copilot</p>
              <p className="text-sm leading-relaxed text-text-secondary">
                We&apos;re provisioning your workspace. You&apos;ll receive a receipt and onboarding
                steps at the email you provided.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href={`/offer/${offerId}`}>Back to offer</Link>
              </Button>
            </CardContent>
          </Card>
          <SecurityFooter />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-root px-4 py-10 font-sans sm:px-6 md:py-14">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 text-center md:text-left">
          <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-syntax-keyword">
            Trust Copilot
          </p>
          <h1 className="mt-2 font-mono text-xl font-semibold text-text-primary sm:text-2xl">
            Checkout
          </h1>
          <p className="mt-1 font-mono text-xs text-text-muted">
            Offer <span className="text-syntax-string">{offerId}</span> · Plan{" "}
            <span className="text-syntax-param">{plan.name}</span>
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
          <Card className="h-fit border-border-default bg-bg-editor">
            <CardHeader>
              <CardTitle className="text-syntax-class">Order summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="font-mono text-sm font-semibold text-text-primary">{plan.name}</p>
                <p className="font-mono text-2xl font-semibold text-syntax-param">
                  ${plan.price}
                  <span className="text-base font-medium text-text-secondary">/mo</span>
                </p>
                <p className="mt-1 text-sm text-text-secondary">Billing cycle: {plan.cycle}</p>
              </div>
              <div>
                <p className="mb-2 font-mono text-[0.65rem] font-semibold uppercase tracking-wider text-text-muted">
                  Included
                </p>
                <ul className="space-y-2 text-sm text-text-secondary">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <span className="font-mono text-accent-green">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-2 border-t border-border-default pt-4 font-mono text-sm">
                <div className="flex justify-between text-text-secondary">
                  <span>Subtotal</span>
                  <span className="text-text-primary">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Est. tax (8%)</span>
                  <span className="text-text-primary">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-border-default pt-2 text-text-primary">
                  <span className="font-semibold">Total</span>
                  <span className="font-semibold text-syntax-class">${total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border-default bg-bg-editor">
            <CardHeader>
              <CardTitle className="text-syntax-builtin">Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label
                    htmlFor="company"
                    className="mb-1.5 block font-mono text-[0.65rem] font-semibold uppercase tracking-wider text-text-muted"
                  >
                    Company name
                  </label>
                  <input
                    id="company"
                    name="company"
                    type="text"
                    autoComplete="organization"
                    placeholder="Nimbus Security"
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block font-mono text-[0.65rem] font-semibold uppercase tracking-wider text-text-muted"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="card"
                    className="mb-1.5 block font-mono text-[0.65rem] font-semibold uppercase tracking-wider text-text-muted"
                  >
                    Card number
                  </label>
                  <input
                    id="card"
                    name="card"
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    placeholder="•••• •••• •••• 4242"
                    className={inputClass}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="expiry"
                      className="mb-1.5 block font-mono text-[0.65rem] font-semibold uppercase tracking-wider text-text-muted"
                    >
                      Expiry
                    </label>
                    <input
                      id="expiry"
                      name="expiry"
                      type="text"
                      autoComplete="cc-exp"
                      placeholder="MM / YY"
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="cvc"
                      className="mb-1.5 block font-mono text-[0.65rem] font-semibold uppercase tracking-wider text-text-muted"
                    >
                      CVC
                    </label>
                    <input
                      id="cvc"
                      name="cvc"
                      type="text"
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      placeholder="123"
                      className={inputClass}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" size="lg" className="mt-2 h-11 w-full">
                  Complete Purchase
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <SecurityFooter className="mt-12" />
      </div>
    </div>
  );
}

function SecurityFooter({ className }: { className?: string }) {
  const items = ["256-bit encryption", "SOC 2 Compliant", "30-day guarantee"] as const;
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-4 text-center",
        className
      )}
    >
      {items.map((label) => (
        <span
          key={label}
          className="font-mono text-[0.6rem] font-semibold uppercase tracking-wider text-text-muted"
        >
          {label}
        </span>
      ))}
    </div>
  );
}
