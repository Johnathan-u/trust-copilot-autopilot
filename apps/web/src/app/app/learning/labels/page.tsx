"use client";

import { Tag } from "lucide-react";
import { EmptyState } from "@/components/ui/states";

export default function OutcomeLabelsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-mono text-lg font-bold text-text-primary">
          <span className="text-syntax-builtin">def</span> outcome_labels
          <span className="text-text-muted">(</span>
          <span className="text-syntax-class">View</span>
          <span className="text-text-muted">):</span>
        </h1>
        <p className="text-xs text-text-muted mt-1">Mark lead quality, decision correctness, and revenue outcomes</p>
      </div>
      <EmptyState
        icon={Tag}
        title="Outcome Labels coming soon"
        description="Mark lead quality, decision correctness, and revenue outcomes."
      />
    </div>
  );
}
