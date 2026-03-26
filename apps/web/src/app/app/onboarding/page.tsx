"use client";

import { Sparkles } from "lucide-react";
import { EmptyState } from "@/components/ui/states";

export default function OnboardingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-mono text-lg font-bold text-text-primary">
          <span className="text-syntax-builtin">def</span> onboarding
          <span className="text-text-muted">(</span>
          <span className="text-syntax-class">View</span>
          <span className="text-text-muted">):</span>
        </h1>
        <p className="text-xs text-text-muted mt-1">Post-payment workspace setup wizard</p>
      </div>
      <EmptyState
        icon={Sparkles}
        title="Onboarding coming soon"
        description="Post-payment workspace setup wizard."
      />
    </div>
  );
}
