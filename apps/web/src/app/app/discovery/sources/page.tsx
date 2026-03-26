"use client";

import { Globe } from "lucide-react";
import { EmptyState } from "@/components/ui/states";

export default function SourceRegistryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-mono text-lg font-bold text-text-primary">
          <span className="text-syntax-builtin">def</span> source_registry
          <span className="text-text-muted">(</span>
          <span className="text-syntax-class">View</span>
          <span className="text-text-muted">):</span>
        </h1>
        <p className="text-xs text-text-muted mt-1">Manage, tag, pause, and prioritize crawl sources</p>
      </div>
      <EmptyState
        icon={Globe}
        title="Source Registry coming soon"
        description="Manage, tag, pause, and prioritize crawl sources."
      />
    </div>
  );
}
