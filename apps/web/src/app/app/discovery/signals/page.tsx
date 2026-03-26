"use client";

import { Zap } from "lucide-react";
import { EmptyState } from "@/components/ui/states";

export default function SignalExplorerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-mono text-lg font-bold text-text-primary">
          <span className="text-syntax-builtin">def</span> signal_explorer
          <span className="text-text-muted">(</span>
          <span className="text-syntax-class">View</span>
          <span className="text-text-muted">):</span>
        </h1>
        <p className="text-xs text-text-muted mt-1">Browse extracted atomic signals with filters</p>
      </div>
      <EmptyState
        icon={Zap}
        title="Signal Explorer coming soon"
        description="Browse extracted atomic signals with filters."
      />
    </div>
  );
}
