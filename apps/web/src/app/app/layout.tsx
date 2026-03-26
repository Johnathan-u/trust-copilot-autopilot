"use client";

import { useState } from "react";
import { Sidebar } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";
import { AuditDrawer } from "@/components/shell/audit-drawer";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [auditOpen, setAuditOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onToggleAudit={() => setAuditOpen(!auditOpen)} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 animate-[fade-in_0.2s_ease-out]">
            {children}
          </div>
        </main>
      </div>
      <AuditDrawer open={auditOpen} onClose={() => setAuditOpen(false)} />
    </div>
  );
}
