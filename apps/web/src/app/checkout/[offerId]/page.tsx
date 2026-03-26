"use client";

import { type FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const PLAN = {
  name: "Professional Trust Platform",
  price: 499,
  cycle: "Monthly",
  features: [
    "SOC 2 automation & control mapping",
    "Trust center + branding",
    "Vendor reviews (25/yr)",
    "Policy templates & workflows",
    "Continuous monitoring signals",
    "Compliance dashboard",
    "Priority support",
    "Dedicated CSM",
  ],
} as const;

const COMPANY_SIZES = ["1–10", "11–50", "51–200", "201–1000", "1000+"] as const;

const inputClass = cn(
  "h-10 w-full rounded-lg border border-border-default bg-bg-input px-3 py-2",
  "font-mono text-sm text-text-primary placeholder:text-text-muted",
  "transition-colors focus:border-border-active focus:ring-1 focus:ring-syntax-param/40 focus:outline-none"
);

const selectClass = cn(inputClass, "appearance-none bg-bg-input");

function randomOrderId() {
  return `TC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

const STEPS = ["Review", "Details", "Payment", "Done"] as const;

export default function CheckoutPage() {
  const params = useParams<{ offerId: string }>();
  const offerId = params.offerId;

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [orderId, setOrderId] = useState<string | null>(null);

  const subtotal = PLAN.price;
  const taxRate = 0.08;
  const tax = Math.round(subtotal * taxRate * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  function goNext() {
    setStep((s) => (s < 4 ? ((s + 1) as 1 | 2 | 3 | 4) : s));
  }

  function goBack() {
    setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3 | 4) : s));
  }

  function handlePaymentSubmit(e: FormEvent) {
    e.preventDefault();
    setOrderId(randomOrderId());
    setStep(4);
  }

  const stepIndex = useMemo(() => step - 1, [step]);

  return (
    <div className="min-h-screen bg-bg-root px-4 py-10 font-sans sm:px-6 md:py-14">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8 text-center">
          <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-syntax-keyword">
            Trust Copilot
          </p>
          <h1 className="mt-2 font-mono text-xl font-semibold text-text-primary sm:text-2xl">
            Checkout
          </h1>
          <p className="mt-1 font-mono text-xs text-text-muted">
            Offer <span className="text-syntax-string">{offerId}</span>
          </p>
        </header>

        <nav
          className="mb-8"
          aria-label="Checkout progress"
        >
          <ol className="flex items-center justify-between gap-1 sm:gap-2">
            {STEPS.map((label, i) => {
              const done = i < stepIndex;
              const active = i === stepIndex;
              return (
                <li key={label} className="flex flex-1 flex-col items-center gap-2 min-w-0">
                  <div className="flex w-full items-center">
                    {i > 0 ? (
                      <span
                        className={cn(
                          "h-px flex-1",
                          done ? "bg-accent-green/60" : "bg-border-default"
                        )}
                        aria-hidden
                      />
                    ) : (
                      <span className="flex-1" />
                    )}
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-mono text-xs font-semibold tabular-nums",
                        done && "border-accent-green/50 bg-accent-green/15 text-accent-green",
                        active &&
                          !done &&
                          "border-border-active bg-bg-card text-syntax-param",
                        !active &&
                          !done &&
                          "border-border-default bg-bg-input text-text-muted"
                      )}
                    >
                      {done ? "✓" : i + 1}
                    </span>
                    {i < STEPS.length - 1 ? (
                      <span
                        className={cn(
                          "h-px flex-1",
                          i < stepIndex ? "bg-accent-green/60" : "bg-border-default"
                        )}
                        aria-hidden
                      />
                    ) : (
                      <span className="flex-1" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "truncate font-mono text-[0.6rem] font-semibold uppercase tracking-wider sm:text-[0.65rem]",
                      active ? "text-syntax-keyword" : "text-text-muted"
                    )}
                  >
                    {label}
                  </span>
                </li>
              );
            })}
          </ol>
        </nav>

        {step === 1 && (
          <Card className="border-border-default bg-bg-editor">
            <CardHeader>
              <CardTitle className="text-syntax-class">Order summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="font-mono text-sm font-semibold text-text-primary">{PLAN.name}</p>
                <p className="mt-1 font-mono text-2xl font-semibold text-syntax-param">
                  ${PLAN.price}
                  <span className="text-base font-medium text-text-secondary">/mo</span>
                </p>
                <p className="mt-1 text-sm text-text-secondary">Billing cycle: {PLAN.cycle}</p>
              </div>
              <div>
                <p className="mb-2 font-mono text-[0.65rem] font-semibold uppercase tracking-wider text-text-muted">
                  Included
                </p>
                <ul className="space-y-2 text-sm text-text-secondary">
                  {PLAN.features.map((f) => (
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
              <Button type="button" size="lg" className="h-11 w-full" onClick={goNext}>
                Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="border-border-default bg-bg-editor">
            <CardHeader>
              <CardTitle className="text-syntax-builtin">Your details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label
                  htmlFor="company"
                  className="mb-1.5 block font-mono text-[0.65rem] font-semibold uppercase tracking-wider text-text-muted"
                >
                  Company name
                </label>
                <Input
                  id="company"
                  name="company"
                  required
                  placeholder="Nimbus Security"
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block font-mono text-[0.65rem] font-semibold uppercase tracking-wider text-text-muted"
                >
                  Work email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@company.com"
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-1.5 block font-mono text-[0.65rem] font-semibold uppercase tracking-wider text-text-muted"
                >
                  Full name
                </label>
                <Input id="fullName" name="fullName" required placeholder="Alex Rivera" className={inputClass} />
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="mb-1.5 block font-mono text-[0.65rem] font-semibold uppercase tracking-wider text-text-muted"
                >
                  Phone <span className="font-sans font-normal normal-case text-text-muted">(optional)</span>
                </label>
                <Input id="phone" name="phone" type="tel" placeholder="+1 …" className={inputClass} />
              </div>
              <div>
                <label
                  htmlFor="size"
                  className="mb-1.5 block font-mono text-[0.65rem] font-semibold uppercase tracking-wider text-text-muted"
                >
                  Company size
                </label>
                <select id="size" name="size" required className={selectClass} defaultValue="">
                  <option value="" disabled>
                    Select…
                  </option>
                  {COMPANY_SIZES.map((s) => (
                    <option key={s} value={s} className="bg-bg-editor text-text-primary">
                      {s} employees
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={goBack}>
                  Back
                </Button>
                <Button type="button" className="flex-1" onClick={goNext}>
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="border-border-default bg-bg-editor">
            <CardHeader>
              <CardTitle className="text-syntax-decorator">Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handlePaymentSubmit}>
                <div>
                  <label
                    htmlFor="card"
                    className="mb-1.5 block font-mono text-[0.65rem] font-semibold uppercase tracking-wider text-text-muted"
                  >
                    Card number
                  </label>
                  <Input
                    id="card"
                    name="card"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    placeholder="4242 4242 4242 4242"
                    required
                    className={inputClass}
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
                    <Input
                      id="expiry"
                      name="expiry"
                      autoComplete="cc-exp"
                      placeholder="MM / YY"
                      required
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="cvc"
                      className="mb-1.5 block font-mono text-[0.65rem] font-semibold uppercase tracking-wider text-text-muted"
                    >
                      CVC
                    </label>
                    <Input
                      id="cvc"
                      name="cvc"
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      placeholder="123"
                      required
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="billing"
                    className="mb-1.5 block font-mono text-[0.65rem] font-semibold uppercase tracking-wider text-text-muted"
                  >
                    Billing address
                  </label>
                  <Input
                    id="billing"
                    name="billing"
                    autoComplete="street-address"
                    placeholder="Street, city, state, ZIP"
                    required
                    className={inputClass}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={goBack}>
                    Back
                  </Button>
                  <Button type="submit" className="flex-1">
                    Pay ${total.toFixed(2)}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 4 && orderId && (
          <Card className="border-2 border-accent-green/40 bg-bg-editor">
            <CardHeader className="border-border-default">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="success">Confirmed</Badge>
                <CardTitle className="text-accent-green">Welcome to Trust Copilot!</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="font-mono text-sm text-text-secondary">
                Order ID{" "}
                <span className="text-syntax-string">{orderId}</span>
              </p>
              <div>
                <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-wider text-text-muted">
                  Next steps
                </p>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-text-secondary">
                  <li>Check your email for the receipt and workspace invite.</li>
                  <li>Schedule onboarding with your dedicated CSM.</li>
                  <li>Explore the platform and connect your first integration.</li>
                </ol>
              </div>
              <Button asChild size="lg" className="h-11 w-full">
                <Link href="/app">Go to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <SecurityFooter className="mt-10" />
      </div>
    </div>
  );
}

function SecurityFooter({ className }: { className?: string }) {
  const items = [
    { label: "Encrypted checkout", icon: "🔒" },
    { label: "SOC 2", icon: "✓" },
    { label: "30-day money-back", icon: "↩" },
  ] as const;
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-6 text-center",
        className
      )}
    >
      {items.map(({ label, icon }) => (
        <span
          key={label}
          className="inline-flex items-center gap-2 font-mono text-[0.6rem] font-semibold uppercase tracking-wider text-text-muted"
        >
          <span className="text-syntax-string" aria-hidden>
            {icon}
          </span>
          {label}
        </span>
      ))}
    </div>
  );
}
