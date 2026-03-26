"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

type CheckoutUiState = "redirecting" | "success" | "cancelled";

function parseStatus(raw: string | null): CheckoutUiState {
  if (raw === "success") return "success";
  if (raw === "cancelled" || raw === "canceled") return "cancelled";
  return "redirecting";
}

export default function CheckoutStatusPage() {
  const params = useParams<{ offerId: string }>();
  const searchParams = useSearchParams();
  const offerId = params.offerId;
  const status = parseStatus(searchParams.get("status"));

  return (
    <div className="min-h-screen bg-bg-root px-6 py-16 md:py-24">
      <div className="mx-auto flex max-w-md flex-col items-center">
        <div className="w-full rounded-2xl border border-border-default bg-bg-editor/80 p-10 text-center md:p-12">
          <div className="mb-6 flex justify-center">
            {status === "redirecting" && (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-accent-blue-bright/30 bg-accent-blue/30 text-accent-blue-bright">
                <Loader2 className="h-8 w-8 animate-spin" strokeWidth={1.5} aria-hidden />
              </div>
            )}
            {status === "success" && (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-accent-green/30 bg-accent-green/10 text-accent-green">
                <CheckCircle2 className="h-8 w-8" strokeWidth={1.5} aria-hidden />
              </div>
            )}
            {status === "cancelled" && (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-accent-red/25 bg-accent-red/10 text-accent-red">
                <XCircle className="h-8 w-8" strokeWidth={1.5} aria-hidden />
              </div>
            )}
          </div>

          <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-text-muted">
            Checkout
          </p>

          {status === "redirecting" && (
            <>
              <h1 className="mt-3 font-mono text-xl font-semibold text-text-primary md:text-2xl">
                Redirecting to payment…
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                You&apos;ll complete payment with our secure provider. This window
                may close automatically when you return.
              </p>
            </>
          )}
          {status === "success" && (
            <>
              <h1 className="mt-3 font-mono text-xl font-semibold text-text-primary md:text-2xl">
                Payment successful
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                Thank you. Your subscription is being activated. You&apos;ll receive
                a confirmation email shortly.
              </p>
            </>
          )}
          {status === "cancelled" && (
            <>
              <h1 className="mt-3 font-mono text-xl font-semibold text-text-primary md:text-2xl">
                Payment cancelled
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                No charge was made. You can return to your offer anytime to try
                again.
              </p>
            </>
          )}

          <p className="mt-6 font-mono text-xs text-text-muted">
            Offer: {offerId}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button variant="outline" asChild className="h-10">
              <Link href={`/offer/${offerId}`}>Back to offer</Link>
            </Button>
            {status === "success" && (
              <Button asChild className="h-10">
                <Link href="/workspace">Go to workspace</Link>
              </Button>
            )}
          </div>

          <p className="mt-8 text-xs text-text-muted">
            Demo: add{" "}
            <code className="rounded bg-bg-input px-1.5 py-0.5 font-mono text-[0.65rem] text-syntax-param">
              ?status=success
            </code>{" "}
            or{" "}
            <code className="rounded bg-bg-input px-1.5 py-0.5 font-mono text-[0.65rem] text-syntax-param">
              ?status=cancelled
            </code>
          </p>
        </div>
      </div>
    </div>
  );
}
