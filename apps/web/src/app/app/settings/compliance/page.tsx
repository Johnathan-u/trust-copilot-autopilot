"use client";

import { Shield } from "lucide-react";
import { EmptyState } from "@/components/ui/states";

export default function CompliancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-mono text-lg font-bold text-text-primary">
          <span className="text-syntax-builtin">def</span> compliance
          <span className="text-text-muted">(</span>
          <span className="text-syntax-class">View</span>
          <span className="text-text-muted">):</span>
        </h1>
        <p className="text-xs text-text-muted mt-1">Legal footer, unsubscribe settings, and physical address</p>
      </div>
      <EmptyState
        icon={Shield}
        title="Compliance coming soon"
        description="Legal footer, unsubscribe settings, and physical address."
      />
    </div>
  );
}
