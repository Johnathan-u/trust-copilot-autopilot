"use client";

import { TrendingUp } from "lucide-react";
import { EmptyState } from "@/components/ui/states";

export default function RevenueFunnelPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-mono text-lg font-bold text-text-primary">
          <span className="text-syntax-builtin">def</span> revenue_funnel
          <span className="text-text-muted">(</span>
          <span className="text-syntax-class">View</span>
          <span className="text-text-muted">):</span>
        </h1>
        <p className="text-xs text-text-muted mt-1">End-to-end metrics from signal to activated customer</p>
      </div>
      <EmptyState
        icon={TrendingUp}
        title="Revenue Funnel coming soon"
        description="End-to-end metrics from signal to activated customer."
      />
    </div>
  );
}
