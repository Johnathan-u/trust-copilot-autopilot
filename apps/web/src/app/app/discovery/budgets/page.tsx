"use client";

import { Gauge } from "lucide-react";
import { EmptyState } from "@/components/ui/states";

export default function DiscoveryBudgetsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-mono text-lg font-bold text-text-primary">
          <span className="text-syntax-builtin">def</span> discovery_budgets
          <span className="text-text-muted">(</span>
          <span className="text-syntax-class">View</span>
          <span className="text-text-muted">):</span>
        </h1>
        <p className="text-xs text-text-muted mt-1">Crawl budgets, concurrency, queue depth controls</p>
      </div>
      <EmptyState
        icon={Gauge}
        title="Discovery Budgets coming soon"
        description="Crawl budgets, concurrency, queue depth controls."
      />
    </div>
  );
}
