"use client";

import { Users } from "lucide-react";
import { EmptyState } from "@/components/ui/states";

export default function AccountPipelinePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-mono text-lg font-bold text-text-primary">
          <span className="text-syntax-builtin">def</span> account_pipeline
          <span className="text-text-muted">(</span>
          <span className="text-syntax-class">View</span>
          <span className="text-text-muted">):</span>
        </h1>
        <p className="text-xs text-text-muted mt-1">All accounts by stage, scores, freshness, and segment</p>
      </div>
      <EmptyState
        icon={Users}
        title="Account Pipeline coming soon"
        description="All accounts by stage, scores, freshness, and segment."
      />
    </div>
  );
}
