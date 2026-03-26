"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MOCK_DESTINATION_URL =
  "https://vendor.example.com/trust/onboarding/welcome";

function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "size-8 shrink-0 rounded-full border-2 border-border-default border-t-syntax-param animate-spin",
        className
      )}
      aria-hidden
    />
  );
}

export default function TrustCopilotRedirectPage() {
  const params = useParams<{ token: string }>();
  const token = typeof params.token === "string" ? params.token : "";
  const [phase, setPhase] = useState<"redirecting" | "revealed">("redirecting");

  useEffect(() => {
    const t = window.setTimeout(() => setPhase("revealed"), 2000);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-bg-root font-sans">
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <p className="text-center font-mono text-sm font-semibold tracking-tight text-text-primary">
            Trust Copilot
          </p>
          <p className="mt-1 text-center text-xs text-text-muted">
            Secure link handler
          </p>

          {phase === "redirecting" && (
            <div className="mt-10 flex flex-col items-center text-center">
              <Spinner className="size-9 border-t-accent-green" />
              <p className="mt-6 text-sm font-medium text-text-primary">
                Redirecting…
              </p>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                You&apos;re being redirected to:{" "}
                <span className="font-mono text-xs text-syntax-string break-all">
                  {MOCK_DESTINATION_URL}
                </span>
              </p>
              <a
                href={MOCK_DESTINATION_URL}
                className="mt-6 text-sm text-syntax-keyword underline decoration-border-default underline-offset-4 transition-colors hover:text-syntax-param"
              >
                Click here if not redirected
              </a>
            </div>
          )}

          {phase === "revealed" && (
            <div className="mt-10 animate-[fade-in_0.35s_ease-out]">
              <Card className="border-border-default bg-bg-card">
                <CardHeader>
                  <CardTitle className="text-syntax-class">
                    Destination
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-[0.65rem] font-mono font-semibold uppercase tracking-wider text-text-muted">
                      URL
                    </p>
                    <p className="mt-1 break-all font-mono text-sm text-syntax-string">
                      {MOCK_DESTINATION_URL}
                    </p>
                  </div>
                  <div>
                    <p className="text-[0.65rem] font-mono font-semibold uppercase tracking-wider text-text-muted">
                      Tracking
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge variant="info">click_id</Badge>
                      <span className="font-mono text-xs text-text-secondary">
                        {token || "—"}
                      </span>
                    </div>
                  </div>
                  <p className="border-t border-border-default pt-4 text-xs leading-relaxed text-text-muted">
                    <span className="font-mono text-syntax-builtin">Privacy:</span>{" "}
                    This redirect was logged for analytics. You can opt out at any
                    time.
                  </p>
                  <Button asChild size="lg" className="w-full">
                    <a href={MOCK_DESTINATION_URL} rel="noopener noreferrer">
                      Continue to destination
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
