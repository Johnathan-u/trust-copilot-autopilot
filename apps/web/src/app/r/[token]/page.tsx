"use client";

import { Shield, Upload } from "lucide-react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function TrustRoomLandingPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;

  return (
    <div className="min-h-screen bg-bg-root px-6 py-16 md:py-24">
      <div className="mx-auto flex max-w-lg flex-col items-center">
        <div className="w-full rounded-2xl border border-border-default bg-bg-editor/80 p-10 shadow-[0_0_0_1px_rgba(78,201,176,0.06),0_24px_64px_-12px_rgba(0,0,0,0.45)] backdrop-blur-sm md:p-12">
          <div className="mb-8 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-syntax-class/25 bg-syntax-class/10 text-syntax-class">
              <Shield className="h-8 w-8" strokeWidth={1.5} aria-hidden />
            </div>
          </div>

          <p className="text-center font-mono text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-syntax-builtin">
            Trust Copilot
          </p>
          <h1 className="mt-3 text-center font-mono text-2xl font-semibold tracking-tight text-text-primary md:text-[1.75rem]">
            Trust Room
          </h1>
          <p className="mt-4 text-center text-[15px] leading-relaxed text-text-secondary">
            Securely upload your compliance questionnaire or security documents.
            Your vendor uses Trust Copilot to review submissions in a controlled,
            encrypted environment.
          </p>

          <div className="mt-10 flex flex-col gap-3">
            <Button size="lg" className="h-12 w-full text-sm">
              <Upload className="h-4 w-4" aria-hidden />
              Upload documents
            </Button>
            <p className="text-center text-xs text-text-muted">
              Reference: <span className="font-mono text-text-secondary">{token}</span>
            </p>
          </div>

          <ul className="mt-10 space-y-3 border-t border-border-default pt-8 text-sm text-text-secondary">
            <li className="flex gap-3">
              <span className="mt-0.5 font-mono text-syntax-class">✓</span>
              <span>
                Files are encrypted in transit and at rest. Access is limited to
                authorized reviewers on your vendor&apos;s side.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 font-mono text-syntax-class">✓</span>
              <span>
                We do not sell your data. Submissions are used only to fulfill
                this trust review.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 font-mono text-syntax-class">✓</span>
              <span>
                Need help? Contact your vendor point of contact—this link is
                unique to your organization.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
