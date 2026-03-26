"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const COMPANY_SHORT = "Nimbus Security";
const TRUST_ROOM_TITLE = "Nimbus Security Trust Room";

const documents = [
  { name: "SOC 2 Report", type: "PDF" as const },
  { name: "Security Policy", type: "DOCX" as const },
  { name: "Architecture Overview", type: "PDF" as const },
  { name: "Penetration Test", type: "PDF" as const },
];

const complianceRows = [
  { framework: "SOC 2 Type II", status: "Active" as const },
  { framework: "ISO 27001", status: "In Progress" as const },
  { framework: "GDPR", status: "Compliant" as const },
];

function complianceBadge(status: (typeof complianceRows)[number]["status"]) {
  switch (status) {
    case "Active":
    case "Compliant":
      return <Badge variant="success">{status}</Badge>;
    case "In Progress":
      return <Badge variant="warning">{status}</Badge>;
    default:
      return <Badge variant="default">{status}</Badge>;
  }
}

export default function TrustRoomPage() {
  const params = useParams<{ token: string }>();
  const token = typeof params.token === "string" ? params.token : "";

  const [ndaAccepted, setNdaAccepted] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [email, setEmail] = useState("");

  const canAccess = checkboxChecked && email.trim().length > 0;

  function handleAccess() {
    if (!canAccess) return;
    setNdaAccepted(true);
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg-root font-sans">
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          <header className="text-center">
            <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-syntax-keyword">
              Trust Copilot
            </p>
            <p className="mt-2 font-mono text-xs text-text-muted">Secure trust room</p>
            {token ? (
              <p className="mt-2 font-mono text-[0.6rem] text-text-muted">
                Link ref: <span className="text-syntax-string">{token}</span>
              </p>
            ) : null}
          </header>

          {!ndaAccepted ? (
            <Card className="mt-10 border-border-default bg-bg-card">
              <CardHeader>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle className="text-text-primary">{COMPANY_SHORT}</CardTitle>
                  <Badge variant="tech" className="normal-case tracking-normal">
                    NDA required
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    Before accessing this trust room, please accept the NDA
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                    Summary of terms:
                  </p>
                  <ul className="mt-3 space-y-2 text-sm leading-relaxed text-text-secondary">
                    <li className="flex gap-2">
                      <span className="font-mono text-accent-green shrink-0">▸</span>
                      Confidential information shared in this room may not be disclosed to third
                      parties or used beyond evaluating a potential business relationship.
                    </li>
                    <li className="flex gap-2">
                      <span className="font-mono text-accent-green shrink-0">▸</span>
                      Materials remain the property of {COMPANY_SHORT}; no license is granted except
                      for the purpose above.
                    </li>
                    <li className="flex gap-2">
                      <span className="font-mono text-accent-green shrink-0">▸</span>
                      Breach may result in legal remedies. By proceeding you confirm authority to
                      bind your organization where applicable.
                    </li>
                  </ul>
                </div>

                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border-default bg-bg-editor px-4 py-3 transition-colors hover:bg-bg-card-hover">
                  <input
                    type="checkbox"
                    checked={checkboxChecked}
                    onChange={(e) => setCheckboxChecked(e.target.checked)}
                    className="mt-1 size-3.5 shrink-0 rounded border-border-default bg-bg-input accent-syntax-param"
                  />
                  <span className="text-sm text-text-secondary">
                    <span className="font-mono text-text-primary">I accept the terms</span> of this
                    non-disclosure agreement.
                  </span>
                </label>

                <div>
                  <label
                    htmlFor="trust-room-email"
                    className="font-mono text-[0.65rem] font-semibold uppercase tracking-wider text-text-muted"
                  >
                    Work email
                  </label>
                  <Input
                    id="trust-room-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <Button
                  type="button"
                  size="lg"
                  className="w-full"
                  disabled={!canAccess}
                  onClick={handleAccess}
                >
                  Access Trust Room
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="mt-10 space-y-8 animate-[fade-in_0.35s_ease-out]">
              <div className="text-center">
                <Badge variant="tech" className="normal-case tracking-normal">
                  {TRUST_ROOM_TITLE}
                </Badge>
                <h1 className="mt-4 font-mono text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">
                  Welcome
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  You now have access to diligence materials and compliance posture for{" "}
                  <span className="font-mono text-text-primary">{COMPANY_SHORT}</span>. Request
                  document access below; your representative will be notified.
                </p>
              </div>

              <div className="space-y-4">
                <Card className="border-border-default bg-bg-card">
                  <CardHeader>
                    <CardTitle className="text-syntax-class">Documents Available</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {documents.map((doc) => (
                      <div
                        key={doc.name}
                        className="flex flex-col gap-3 rounded-lg border border-border-default bg-bg-editor px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="font-mono text-sm font-medium text-text-primary">
                            {doc.name}
                          </p>
                          <Badge variant="route" className="mt-2">
                            {doc.type}
                          </Badge>
                        </div>
                        <Button type="button" variant="outline" size="sm" className="shrink-0">
                          Request Access
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-border-default bg-bg-card">
                  <CardHeader>
                    <CardTitle className="text-syntax-builtin">Compliance Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {complianceRows.map((row) => (
                      <div
                        key={row.framework}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border-default bg-bg-editor px-4 py-3"
                      >
                        <span className="font-mono text-sm font-medium text-text-primary">
                          {row.framework}
                        </span>
                        {complianceBadge(row.status)}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-border-default bg-bg-card">
                  <CardHeader>
                    <CardTitle className="text-syntax-string">Contact</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-text-secondary">
                      Questions? Contact your{" "}
                      <span className="font-mono text-syntax-param">Trust Copilot</span>{" "}
                      representative for expedited access, custom evidence, or clarification on any
                      control or artifact.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          <p className="mt-12 text-center text-xs text-text-muted">
            <span className="font-mono text-text-secondary">Trust Copilot</span> — vendor trust,
            simplified.
          </p>
        </div>
      </main>
    </div>
  );
}
