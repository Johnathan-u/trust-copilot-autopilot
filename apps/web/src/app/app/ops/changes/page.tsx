"use client";

import { History } from "lucide-react";
import { EmptyState } from "@/components/ui/states";

export default function ChangeLogPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-mono text-lg font-bold text-text-primary">
          <span className="text-syntax-builtin">def</span> change_log
          <span className="text-text-muted">(</span>
          <span className="text-syntax-class">View</span>
          <span className="text-text-muted">):</span>
        </h1>
        <p className="text-xs text-text-muted mt-1">Version history for policies, prompts, and ranking models</p>
      </div>
      <EmptyState
        icon={History}
        title="Change Log coming soon"
        description="Version history for policies, prompts, and ranking models."
      />
    </div>
  );
}
