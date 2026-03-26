"use client";

import { GitCompare } from "lucide-react";
import { EmptyState } from "@/components/ui/states";

export default function ShadowScoringPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-mono text-lg font-bold text-text-primary">
          <span className="text-syntax-builtin">def</span> shadow_scoring
          <span className="text-text-muted">(</span>
          <span className="text-syntax-class">View</span>
          <span className="text-text-muted">):</span>
        </h1>
        <p className="text-xs text-text-muted mt-1">Compare rule scores vs model scores before rollout</p>
      </div>
      <EmptyState
        icon={GitCompare}
        title="Shadow Scoring coming soon"
        description="Compare rule scores vs model scores before rollout."
      />
    </div>
  );
}
