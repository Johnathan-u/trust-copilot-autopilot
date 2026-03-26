"use client";

import { BarChart3 } from "lucide-react";
import { EmptyState } from "@/components/ui/states";

export default function EvaluationDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-mono text-lg font-bold text-text-primary">
          <span className="text-syntax-builtin">def</span> evaluation_dashboard
          <span className="text-text-muted">(</span>
          <span className="text-syntax-class">View</span>
          <span className="text-text-muted">):</span>
        </h1>
        <p className="text-xs text-text-muted mt-1">Win-rate by segment, offline eval metrics, and cohort comparisons</p>
      </div>
      <EmptyState
        icon={BarChart3}
        title="Evaluation Dashboard coming soon"
        description="Win-rate by segment, offline eval metrics, and cohort comparisons."
      />
    </div>
  );
}
