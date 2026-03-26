"use client";

import { useCallback, useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const MERGE_TAGS = [
  { key: "first_name", label: "{first_name}" },
  { key: "company", label: "{company}" },
  { key: "pain_point", label: "{pain_point}" },
  { key: "proof_url", label: "{proof_url}" },
] as const;

const SAMPLE_VALUES: Record<string, string> = {
  first_name: "Alex",
  company: "Acme Corp",
  pain_point: "low reply rates on outbound",
  proof_url: "https://proof.trustcopilot.com/demo",
};

function applyMergePreview(text: string): string {
  return text
    .replace(/\{first_name\}/g, SAMPLE_VALUES.first_name)
    .replace(/\{company\}/g, SAMPLE_VALUES.company)
    .replace(/\{pain_point\}/g, SAMPLE_VALUES.pain_point)
    .replace(/\{proof_url\}/g, SAMPLE_VALUES.proof_url);
}

export default function ComposeEmailPage() {
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const [fromMailbox, setFromMailbox] = useState("outreach@go.trustcopilot.com");
  const [to, setTo] = useState("prospect@example.com");
  const [subject, setSubject] = useState(
    "Quick idea for {company}'s outbound — {first_name}"
  );
  const [body, setBody] = useState(
    "Hi {first_name},\n\nNoticed {company} may be hitting {pain_point}. Here's a one-pager: {proof_url}\n\n— Trust Copilot"
  );

  const insertTag = useCallback((token: string) => {
    const el = bodyRef.current;
    if (!el) {
      setBody((b) => b + token);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const next = body.slice(0, start) + token + body.slice(end);
    setBody(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + token.length;
      el.setSelectionRange(pos, pos);
    });
  }, [body]);

  const previewSubject = applyMergePreview(subject);
  const previewBody = applyMergePreview(body);

  return (
    <div className="flex flex-col gap-4 min-h-[calc(100vh-6rem)]">
      <div>
        <h1 className="font-mono text-lg font-bold text-text-primary">
          <span className="text-syntax-builtin">def</span> compose_email
          <span className="text-text-muted">(</span>
          <span className="text-syntax-class">Editor</span>
          <span className="text-text-muted">):</span>
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Draft outreach with merge tags and a live client-style preview
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        <Card className="flex flex-col min-h-[420px] lg:min-h-0 bg-bg-editor">
          <CardHeader className="shrink-0">
            <CardTitle className="text-syntax-param">Editor</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 flex-1 min-h-0">
            <div className="space-y-1.5">
              <label className="font-mono text-[0.65rem] font-semibold uppercase tracking-wider text-text-muted">
                From
              </label>
              <select
                value={fromMailbox}
                onChange={(e) => setFromMailbox(e.target.value)}
                className={cn(
                  "flex h-8 w-full rounded-lg border border-border-default bg-bg-input px-3 py-1",
                  "font-mono text-xs text-text-primary",
                  "transition-colors duration-200",
                  "focus:outline-none focus:border-accent-blue-bright focus:ring-1 focus:ring-accent-blue-bright/30"
                )}
              >
                <option value="outreach@go.trustcopilot.com">
                  outreach@go.trustcopilot.com
                </option>
                <option value="team@app.trustcopilot.com">
                  team@app.trustcopilot.com
                </option>
                <option value="sandbox@cert.trustcopilot.com">
                  sandbox@cert.trustcopilot.com
                </option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="font-mono text-[0.65rem] font-semibold uppercase tracking-wider text-text-muted">
                To
              </label>
              <Input
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="recipient@company.com"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-mono text-[0.65rem] font-semibold uppercase tracking-wider text-text-muted">
                Subject
              </label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject line"
              />
            </div>
            <div className="space-y-1.5 flex-1 flex flex-col min-h-[180px]">
              <label className="font-mono text-[0.65rem] font-semibold uppercase tracking-wider text-text-muted">
                Body
              </label>
              <textarea
                ref={bodyRef}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className={cn(
                  "flex-1 min-h-[160px] w-full rounded-lg border border-border-default bg-bg-input px-3 py-2",
                  "font-mono text-xs text-text-primary placeholder:text-text-muted",
                  "resize-y transition-colors duration-200",
                  "focus:outline-none focus:border-accent-blue-bright focus:ring-1 focus:ring-accent-blue-bright/30"
                )}
                placeholder="Write your message…"
              />
            </div>
            <div className="space-y-2 shrink-0">
              <span className="font-mono text-[0.65rem] font-semibold uppercase tracking-wider text-text-muted">
                Variables
              </span>
              <div className="flex flex-wrap gap-2">
                {MERGE_TAGS.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => insertTag(label)}
                    className="focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue-bright/40 rounded-md"
                  >
                    <Badge
                      variant="info"
                      className="cursor-pointer hover:bg-syntax-param/20 transition-colors normal-case tracking-normal text-[0.65rem] py-1"
                    >
                      {label}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col min-h-[420px] lg:min-h-0 bg-bg-editor">
          <CardHeader className="shrink-0">
            <CardTitle className="text-syntax-param">Live preview</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 flex flex-col">
            <div
              className={cn(
                "rounded-lg border border-border-default shadow-sm flex-1 overflow-auto",
                "bg-[#f8f8fc] text-[#1a1a2e]"
              )}
            >
              <div className="p-5 space-y-4 text-sm">
                <div className="space-y-1 border-b border-[#1a1a2e]/10 pb-3">
                  <div className="font-mono text-[0.65rem] text-[#1a1a2e]/55">
                    From
                  </div>
                  <div className="font-mono text-xs font-medium">{fromMailbox}</div>
                </div>
                <div className="space-y-1 border-b border-[#1a1a2e]/10 pb-3">
                  <div className="font-mono text-[0.65rem] text-[#1a1a2e]/55">
                    To
                  </div>
                  <div className="font-mono text-xs font-medium">{to}</div>
                </div>
                <div className="space-y-1 border-b border-[#1a1a2e]/10 pb-3">
                  <div className="font-mono text-[0.65rem] text-[#1a1a2e]/55">
                    Subject
                  </div>
                  <div className="font-mono text-sm font-semibold leading-snug">
                    {previewSubject}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="font-mono text-[0.65rem] text-[#1a1a2e]/55">
                    Message
                  </div>
                  <pre className="font-mono text-xs whitespace-pre-wrap leading-relaxed text-[#1a1a2e]">
                    {previewBody}
                  </pre>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div
        className={cn(
          "flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4",
          "rounded-xl border border-border-default bg-bg-card px-4 py-3"
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button">Send</Button>
          <Button type="button" variant="outline">
            Schedule
          </Button>
          <Button type="button" variant="ghost">
            Save Draft
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
          <Badge variant="success" className="normal-case tracking-normal text-[0.6rem]">
            Suppression: clear
          </Badge>
          <Badge variant="success" className="normal-case tracking-normal text-[0.6rem]">
            Rate limit: ok
          </Badge>
        </div>
      </div>
    </div>
  );
}
