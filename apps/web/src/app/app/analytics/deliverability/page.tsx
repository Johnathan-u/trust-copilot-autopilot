"use client";

import { BarChart3 } from "lucide-react";
import { EmptyState } from "@/components/ui/states";

export default function DeliverabilityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-mono text-lg font-bold text-text-primary">
          <span className="text-syntax-builtin">def</span> deliverability
          <span className="text-text-muted">(</span>
          <span className="text-syntax-class">View</span>
          <span className="text-text-muted">):</span>
        </h1>
        <p className="text-xs text-text-muted mt-1">Send volume, bounce rate, complaint rate, mailbox health over time</p>
      </div>
      <EmptyState
        icon={BarChart3}
        title="Deliverability coming soon"
        description="Send volume, bounce rate, complaint rate, mailbox health over time."
      />
    </div>
  );
}
