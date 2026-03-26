"use client";

import { Inbox } from "lucide-react";
import { EmptyState } from "@/components/ui/states";

export default function UnifiedInboxPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-mono text-lg font-bold text-text-primary">
          <span className="text-syntax-builtin">def</span> unified_inbox
          <span className="text-text-muted">(</span>
          <span className="text-syntax-class">View</span>
          <span className="text-text-muted">):</span>
        </h1>
        <p className="text-xs text-text-muted mt-1">Account-linked threads, classifier labels, and message history</p>
      </div>
      <EmptyState
        icon={Inbox}
        title="Unified Inbox coming soon"
        description="Account-linked threads, classifier labels, and message history."
      />
    </div>
  );
}
