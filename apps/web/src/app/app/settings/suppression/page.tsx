"use client";

import { Ban } from "lucide-react";
import { EmptyState } from "@/components/ui/states";

export default function SuppressionListsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-mono text-lg font-bold text-text-primary">
          <span className="text-syntax-builtin">def</span> suppression_lists
          <span className="text-text-muted">(</span>
          <span className="text-syntax-class">View</span>
          <span className="text-text-muted">):</span>
        </h1>
        <p className="text-xs text-text-muted mt-1">Global suppression, domain denylist, and protected accounts</p>
      </div>
      <EmptyState
        icon={Ban}
        title="Suppression Lists coming soon"
        description="Global suppression, domain denylist, and protected accounts."
      />
    </div>
  );
}
