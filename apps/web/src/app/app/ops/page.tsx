"use client";

import { Wrench } from "lucide-react";
import { EmptyState } from "@/components/ui/states";

export default function OpsConsolePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-mono text-lg font-bold text-text-primary">
          <span className="text-syntax-builtin">def</span> ops_console
          <span className="text-text-muted">(</span>
          <span className="text-syntax-class">View</span>
          <span className="text-text-muted">):</span>
        </h1>
        <p className="text-xs text-text-muted mt-1">Backfills, workflow replays, queue repair, and incident annotation</p>
      </div>
      <EmptyState
        icon={Wrench}
        title="Ops Console coming soon"
        description="Backfills, workflow replays, queue repair, and incident annotation."
      />
    </div>
  );
}
