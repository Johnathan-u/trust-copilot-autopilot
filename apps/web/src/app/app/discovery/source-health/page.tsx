"use client";

import { HeartPulse } from "lucide-react";
import { EmptyState } from "@/components/ui/states";

export default function SourceHealthPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-mono text-lg font-bold text-text-primary">
          <span className="text-syntax-builtin">def</span> source_health
          <span className="text-text-muted">(</span>
          <span className="text-syntax-class">View</span>
          <span className="text-text-muted">):</span>
        </h1>
        <p className="text-xs text-text-muted mt-1">Per-source success rate, latency, and alert state</p>
      </div>
      <EmptyState
        icon={HeartPulse}
        title="Source Health coming soon"
        description="Per-source success rate, latency, and alert state."
      />
    </div>
  );
}
