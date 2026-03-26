"use client";

import { FlaskConical } from "lucide-react";
import { EmptyState } from "@/components/ui/states";

export default function PolicySimulatorPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-mono text-lg font-bold text-text-primary">
          <span className="text-syntax-builtin">def</span> policy_simulator
          <span className="text-text-muted">(</span>
          <span className="text-syntax-class">View</span>
          <span className="text-text-muted">):</span>
        </h1>
        <p className="text-xs text-text-muted mt-1">Test send eligibility and see blocking rules</p>
      </div>
      <EmptyState
        icon={FlaskConical}
        title="Policy Simulator coming soon"
        description="Test send eligibility and see blocking rules."
      />
    </div>
  );
}
