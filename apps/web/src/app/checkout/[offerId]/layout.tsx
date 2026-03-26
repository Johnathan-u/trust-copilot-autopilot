import { Suspense } from "react";

function CheckoutFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-root px-6">
      <div className="rounded-2xl border border-border-default bg-bg-editor/80 px-10 py-12 text-center">
        <p className="font-mono text-sm text-text-secondary">Loading checkout…</p>
      </div>
    </div>
  );
}

export default function CheckoutOfferLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={<CheckoutFallback />}>{children}</Suspense>;
}
