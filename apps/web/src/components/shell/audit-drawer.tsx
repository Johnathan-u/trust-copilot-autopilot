"use client";

import { X, Filter, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  entity_type: string;
  entity_id: string;
  payload_summary?: string;
}

const MOCK_EVENTS: AuditEvent[] = [
  { id: "1", timestamp: "2026-03-25T14:32:00Z", actor: "system", action: "state_transition", entity_type: "account", entity_id: "acc_a1b2", payload_summary: "qualified → contactable" },
  { id: "2", timestamp: "2026-03-25T14:30:00Z", actor: "system", action: "signal_extracted", entity_type: "signal", entity_id: "sig_x9y8", payload_summary: "soc2_announced (0.92)" },
  { id: "3", timestamp: "2026-03-25T14:28:00Z", actor: "policy", action: "send_blocked", entity_type: "message", entity_id: "msg_k3l4", payload_summary: "ICP score below threshold" },
  { id: "4", timestamp: "2026-03-25T14:25:00Z", actor: "system", action: "crawl_complete", entity_type: "source", entity_id: "src_m5n6", payload_summary: "142 pages, 23 signals" },
  { id: "5", timestamp: "2026-03-25T14:20:00Z", actor: "operator", action: "suppression_added", entity_type: "contact", entity_id: "con_p7q8", payload_summary: "do-not-contact: legal request" },
];

const actionColors: Record<string, string> = {
  state_transition: "text-syntax-class",
  signal_extracted: "text-syntax-builtin",
  send_blocked: "text-accent-red",
  crawl_complete: "text-syntax-string",
  suppression_added: "text-accent-yellow",
};

interface AuditDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function AuditDrawer({ open, onClose }: AuditDrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-[380px] bg-bg-sidebar border-l border-border-default shadow-2xl animate-[slide-in-right_0.2s_ease-out]">
      <div className="flex items-center justify-between px-4 h-12 border-b border-border-default">
        <h2 className="font-mono text-xs font-semibold text-syntax-param uppercase tracking-wider">
          Activity Feed
        </h2>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Filter size={13} />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <RefreshCw size={13} />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X size={14} />
          </Button>
        </div>
      </div>

      <div className="px-4 py-2 border-b border-border-default">
        <Input placeholder="Filter events..." className="h-7 text-[0.68rem]" />
      </div>

      <div className="overflow-y-auto h-[calc(100vh-96px)]">
        {MOCK_EVENTS.map((event) => (
          <div
            key={event.id}
            className="px-4 py-3 border-b border-border-default hover:bg-bg-card transition-colors cursor-default"
          >
            <div className="flex items-center justify-between mb-1">
              <span
                className={cn(
                  "font-mono text-[0.65rem] font-semibold",
                  actionColors[event.action] || "text-text-secondary"
                )}
              >
                {event.action.replace(/_/g, " ")}
              </span>
              <span className="font-mono text-[0.6rem] text-text-muted">
                {new Date(event.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="default">{event.entity_type}</Badge>
              <span className="font-mono text-[0.62rem] text-syntax-decorator">
                {event.entity_id}
              </span>
            </div>
            {event.payload_summary && (
              <p className="text-[0.68rem] text-text-muted leading-relaxed">
                {event.payload_summary}
              </p>
            )}
            <div className="mt-1 font-mono text-[0.58rem] text-text-muted">
              by {event.actor}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
