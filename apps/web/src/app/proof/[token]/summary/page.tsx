"use client";

import { FileText } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function ProofSummaryLandingPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;

  const stats = [
    { label: "Controls covered", value: "—" },
    { label: "Open items", value: "—" },
    { label: "Last updated", value: "—" },
  ];

  return (
    <div className="min-h-screen bg-bg-root px-6 py-20 md:py-28">
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl border border-border-default bg-bg-editor/60 p-8 md:p-10">
          <div className="mb-6 flex justify-center">
            <div className="rounded-xl border border-border-active bg-bg-card p-3 text-syntax-builtin">
              <FileText className="h-7 w-7" strokeWidth={1.5} aria-hidden />
            </div>
          </div>

          <h1 className="text-center font-mono text-lg font-semibold text-text-primary md:text-xl">
            Proof summary
          </h1>
          <p className="mt-2 text-center text-sm text-text-secondary">
            Quick snapshot from your email. Open the full proof for detail and
            downloads.
          </p>

          <dl className="mt-8 space-y-4 rounded-xl border border-border-default bg-bg-card/50 p-5">
            {stats.map((s) => (
              <div
                key={s.label}
                className="flex items-center justify-between gap-4 border-b border-border-default pb-4 last:border-0 last:pb-0"
              >
                <dt className="text-sm text-text-secondary">{s.label}</dt>
                <dd className="font-mono text-sm font-medium text-text-primary">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 flex flex-col items-center gap-3">
            <Button asChild size="lg" className="h-11 w-full text-sm sm:w-auto sm:min-w-[220px]">
              <Link href={`/proof/${token}`}>View full proof</Link>
            </Button>
            <p className="text-center font-mono text-[0.65rem] text-text-muted">
              {token}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
