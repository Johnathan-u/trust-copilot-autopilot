"use client";

import { Fragment } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const COMPANY_NAME = "Nimbus Security";

type StepState = "complete" | "active" | "pending";

const pipelineSteps: { id: string; label: string; state: StepState }[] = [
  { id: "upload", label: "Upload Received", state: "complete" },
  { id: "virus", label: "Virus Scan", state: "complete" },
  { id: "extract", label: "Content Extraction", state: "active" },
  { id: "map", label: "Compliance Mapping", state: "pending" },
  { id: "report", label: "Report Generation", state: "pending" },
];

const fileRows = [
  { name: "soc2-report-2025.pdf", status: "processing" as const },
  { name: "security-policy-v3.docx", status: "queued" as const },
  { name: "pentest-results.pdf", status: "completed" as const },
];

function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "size-4 shrink-0 rounded-full border-2 border-border-default border-t-syntax-param animate-spin",
        className
      )}
      aria-hidden
    />
  );
}

function fileStatusBadge(status: (typeof fileRows)[number]["status"]) {
  switch (status) {
    case "completed":
      return <Badge variant="success">completed</Badge>;
    case "processing":
      return <Badge variant="info">processing</Badge>;
    case "queued":
      return <Badge variant="default">queued</Badge>;
    default:
      return <Badge variant="default">{status}</Badge>;
  }
}

export default function DocumentProcessingStatusPage() {
  const params = useParams<{ token: string }>();
  const token = typeof params.token === "string" ? params.token : "";

  return (
    <div className="min-h-screen bg-bg-root px-4 py-12 font-sans sm:px-6 md:py-16">
      <div className="mx-auto max-w-3xl">
        <header className="mb-10 text-center">
          <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-syntax-keyword">
            Trust Copilot
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <h1 className="font-mono text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">
              Document Processing Status
            </h1>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <Badge variant="tech" className="normal-case tracking-normal">
              {COMPANY_NAME}
            </Badge>
            {token ? (
              <span className="font-mono text-[0.6rem] text-text-muted">
                ref <span className="text-syntax-string">{token}</span>
              </span>
            ) : null}
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-text-muted">
            <span
              className="size-1.5 shrink-0 rounded-full bg-syntax-param animate-pulse"
              aria-hidden
            />
            <span className="font-mono">Refreshing every 10s</span>
          </div>
        </header>

        <Card className="mb-8 border-border-default bg-bg-card">
          <CardHeader>
            <CardTitle className="text-syntax-class">Processing pipeline</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <div className="flex min-w-[520px] items-start px-1">
              {pipelineSteps.map((step, i) => (
                <Fragment key={step.id}>
                  {i > 0 ? (
                    <div
                      className={cn(
                        "mt-[18px] h-0.5 min-w-[12px] flex-1",
                        pipelineSteps[i - 1]!.state === "complete"
                          ? "bg-accent-green/40"
                          : "bg-border-default"
                      )}
                      aria-hidden
                    />
                  ) : null}
                  <div className="flex w-[92px] shrink-0 flex-col items-center text-center sm:w-[104px]">
                    <div
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-full border-2 font-mono text-xs font-bold",
                        step.state === "complete" &&
                          "border-accent-green/50 bg-accent-green/10 text-accent-green",
                        step.state === "active" &&
                          "border-syntax-param/50 bg-syntax-param/10 text-syntax-param",
                        step.state === "pending" &&
                          "border-border-default bg-bg-input text-text-muted"
                      )}
                    >
                      {step.state === "complete" ? (
                        "✓"
                      ) : step.state === "active" ? (
                        <Spinner />
                      ) : (
                        "·"
                      )}
                    </div>
                    <p
                      className={cn(
                        "mt-2 font-mono text-[0.6rem] font-medium leading-tight sm:text-[0.65rem]",
                        step.state === "pending" ? "text-text-muted" : "text-text-primary"
                      )}
                    >
                      {step.label}
                    </p>
                  </div>
                </Fragment>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 border-border-default bg-bg-card">
          <CardHeader>
            <CardTitle className="text-syntax-builtin">Current step</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-sm leading-relaxed text-text-primary">
              Extracting content from{" "}
              <span className="text-syntax-string">soc2-report-2025.pdf</span>
              <span className="text-text-secondary"> — Page 12 of 45</span>
            </p>
            <p className="mt-3 text-sm text-text-secondary">
              Estimated time remaining:{" "}
              <span className="font-mono text-syntax-param">~3 minutes</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-border-default bg-bg-card">
          <CardHeader>
            <CardTitle className="text-syntax-string">Uploaded files</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {fileRows.map((row) => (
              <div
                key={row.name}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border-default bg-bg-editor px-4 py-3"
              >
                <span className="font-mono text-xs text-text-primary">{row.name}</span>
                {fileStatusBadge(row.status)}
              </div>
            ))}
          </CardContent>
        </Card>

        <p className="mt-10 text-center text-xs text-text-muted">
          Live updates reflect processing stages for this trust room upload batch.
        </p>
      </div>
    </div>
  );
}
