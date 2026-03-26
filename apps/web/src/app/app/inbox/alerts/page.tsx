"use client";

import { AlertTriangle } from "lucide-react";
import { EmptyState } from "@/components/ui/states";

export default function DeliverabilityAlertsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-mono text-lg font-bold text-text-primary">
          <span className="text-syntax-builtin">def</span> deliverability_alerts
          <span className="text-text-muted">(</span>
          <span className="text-syntax-class">View</span>
          <span className="text-text-muted">):</span>
        </h1>
        <p className="text-xs text-text-muted mt-1">Bounce spikes, complaint thresholds, and mailbox pauses</p>
      </div>
      <EmptyState
        icon={AlertTriangle}
        title="Deliverability Alerts coming soon"
        description="Bounce spikes, complaint thresholds, and mailbox pauses."
      />
    </div>
  );
}
