"use client";

import { Award, Download } from "lucide-react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function ProofPackViewerPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;

  const metrics = [
    { label: "Coverage", value: "—%", hint: "Placeholder" },
    { label: "Gaps found", value: "—", hint: "Placeholder" },
    { label: "Questions answered", value: "—", hint: "Placeholder" },
  ];

  return (
    <div className="min-h-screen bg-bg-root px-6 py-16 md:py-24">
      <div className="mx-auto flex max-w-xl flex-col items-center">
        <div className="w-full rounded-2xl border border-border-default bg-bg-editor/80 p-10 md:p-12">
          <div className="mb-8 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-accent-green/25 bg-accent-green/10 text-accent-green">
              <Award className="h-8 w-8" strokeWidth={1.5} aria-hidden />
            </div>
          </div>

          <p className="text-center font-mono text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-syntax-class">
            Proof delivery
          </p>
          <h1 className="mt-3 text-center font-mono text-2xl font-semibold tracking-tight text-text-primary">
            Your proof pack
          </h1>
          <p className="mt-3 text-center text-[15px] leading-relaxed text-text-secondary">
            A consolidated view of how your organization maps to the requested
            controls. Download the full pack for offline sharing or audits.
          </p>
          <p className="mt-2 text-center font-mono text-xs text-text-muted">
            Token: {token}
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {metrics.map((m) => (
              <div
                key={m.label}
                className="rounded-xl border border-border-default bg-bg-card px-4 py-5 text-center"
              >
                <p className="font-mono text-2xl font-semibold text-accent-blue-bright">
                  {m.value}
                </p>
                <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-wider text-text-muted">
                  {m.label}
                </p>
                <p className="mt-2 text-xs text-text-muted">{m.hint}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" className="h-12 min-w-[200px] text-sm">
              <Download className="h-4 w-4" aria-hidden />
              Download proof pack
            </Button>
          </div>

          <p className="mt-8 text-center text-xs leading-relaxed text-text-muted">
            This link is private. If you did not expect this document, contact
            your Trust Copilot administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
