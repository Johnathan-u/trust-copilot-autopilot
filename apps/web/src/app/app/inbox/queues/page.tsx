"use client";

import { ListTodo } from "lucide-react";
import { EmptyState } from "@/components/ui/states";

export default function ActionQueuesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-mono text-lg font-bold text-text-primary">
          <span className="text-syntax-builtin">def</span> action_queues
          <span className="text-text-muted">(</span>
          <span className="text-syntax-class">View</span>
          <span className="text-text-muted">):</span>
        </h1>
        <p className="text-xs text-text-muted mt-1">Next-action queues split by reply classification</p>
      </div>
      <EmptyState
        icon={ListTodo}
        title="Action Queues coming soon"
        description="Next-action queues split by reply classification."
      />
    </div>
  );
}
