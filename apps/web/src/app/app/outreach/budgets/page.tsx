"use client";

import { CalendarClock } from "lucide-react";
import { EmptyState } from "@/components/ui/states";

export default function SendBudgetsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-mono text-lg font-bold text-text-primary">
          <span className="text-syntax-builtin">def</span> send_budgets
          <span className="text-text-muted">(</span>
          <span className="text-syntax-class">View</span>
          <span className="text-text-muted">):</span>
        </h1>
        <p className="text-xs text-text-muted mt-1">Daily send budgets by mailbox, time zones, and policy caps</p>
      </div>
      <EmptyState
        icon={CalendarClock}
        title="Send Budgets coming soon"
        description="Daily send budgets by mailbox, time zones, and policy caps."
      />
    </div>
  );
}
