"use client";

import { Globe } from "lucide-react";
import { EmptyState } from "@/components/ui/states";

export default function SendingDomainsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-mono text-lg font-bold text-text-primary">
          <span className="text-syntax-builtin">def</span> sending_domains
          <span className="text-text-muted">(</span>
          <span className="text-syntax-class">View</span>
          <span className="text-text-muted">):</span>
        </h1>
        <p className="text-xs text-text-muted mt-1">Setup and manage outreach and transactional sending domains</p>
      </div>
      <EmptyState
        icon={Globe}
        title="Sending Domains coming soon"
        description="Setup and manage outreach and transactional sending domains."
      />
    </div>
  );
}
