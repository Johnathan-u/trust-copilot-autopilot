"use client";

import { FileCheck } from "lucide-react";
import { useParams } from "next/navigation";

const STEPS = [
  { id: "uploaded", label: "Uploaded" },
  { id: "processing", label: "Processing" },
  { id: "analyzing", label: "Analyzing" },
  { id: "complete", label: "Complete" },
] as const;

/** Placeholder: first two steps complete for demo UI */
const ACTIVE_INDEX = 1;

export default function TrustRoomStatusPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;

  return (
    <div className="min-h-screen bg-bg-root px-6 py-16 md:py-24">
      <div className="mx-auto flex max-w-lg flex-col items-center">
        <div className="w-full rounded-2xl border border-border-default bg-bg-editor/80 p-10 md:p-12">
          <div className="mb-8 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-syntax-builtin/25 bg-syntax-builtin/10 text-syntax-builtin">
              <FileCheck className="h-8 w-8" strokeWidth={1.5} aria-hidden />
            </div>
          </div>

          <h1 className="text-center font-mono text-xl font-semibold tracking-tight text-text-primary md:text-2xl">
            We received your files
          </h1>
          <p className="mt-3 text-center text-[15px] leading-relaxed text-text-secondary">
            Thank you. Your submission is secure and queued for review. You can
            keep this page open—we&apos;ll update progress as your materials move
            through our pipeline.
          </p>
          <p className="mt-2 text-center font-mono text-xs text-text-muted">
            Room: {token}
          </p>

          <ol className="mt-10 space-y-0" aria-label="Processing progress">
            {STEPS.map((step, index) => {
              const done = index <= ACTIVE_INDEX;
              const current = index === ACTIVE_INDEX;
              return (
                <li key={step.id} className="relative flex gap-4 pb-8 last:pb-0">
                  {index < STEPS.length - 1 && (
                    <span
                      className="absolute left-[15px] top-8 h-[calc(100%-0.5rem)] w-px bg-border-default"
                      aria-hidden
                    />
                  )}
                  <span
                    className={`relative z-[1] flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-mono text-xs font-semibold ${
                      done
                        ? current
                          ? "border-accent-blue-bright bg-accent-blue-bright/20 text-accent-blue-bright"
                          : "border-syntax-class/40 bg-syntax-class/15 text-syntax-class"
                        : "border-border-default bg-bg-input text-text-muted"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div className="pt-1">
                    <p
                      className={`font-mono text-sm font-medium ${
                        done ? "text-text-primary" : "text-text-muted"
                      }`}
                    >
                      {step.label}
                    </p>
                    {current && (
                      <p className="mt-1 text-sm text-text-secondary">
                        This usually takes a few minutes. No action needed from
                        you.
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>

          <p className="mt-8 border-t border-border-default pt-8 text-center text-sm text-text-secondary">
            Questions? Reach out to your vendor contact. We never ask for
            passwords or payment on this page.
          </p>
        </div>
      </div>
    </div>
  );
}
