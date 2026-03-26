"use client";

import { BookOpen } from "lucide-react";
import { EmptyState } from "@/components/ui/states";

export default function RunbooksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-mono text-lg font-bold text-text-primary">
          <span className="text-syntax-builtin">def</span> runbooks
          <span className="text-text-muted">(</span>
          <span className="text-syntax-class">View</span>
          <span className="text-text-muted">):</span>
        </h1>
        <p className="text-xs text-text-muted mt-1">Operational runbooks and incident checklists</p>
      </div>
      <EmptyState
        icon={BookOpen}
        title="Runbooks coming soon"
        description="Operational runbooks and incident checklists."
      />
    </div>
  );
}
