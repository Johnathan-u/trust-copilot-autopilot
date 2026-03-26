"use client";

import { Mail } from "lucide-react";
import { EmptyState } from "@/components/ui/states";

export default function MailboxesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-mono text-lg font-bold text-text-primary">
          <span className="text-syntax-builtin">def</span> mailboxes
          <span className="text-text-muted">(</span>
          <span className="text-syntax-class">View</span>
          <span className="text-text-muted">):</span>
        </h1>
        <p className="text-xs text-text-muted mt-1">Mailbox inventory, caps, warmup, rotation, and reply routing</p>
      </div>
      <EmptyState
        icon={Mail}
        title="Mailboxes coming soon"
        description="Mailbox inventory, caps, warmup, rotation, and reply routing."
      />
    </div>
  );
}
