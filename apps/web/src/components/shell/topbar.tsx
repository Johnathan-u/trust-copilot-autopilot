"use client";

import { usePathname } from "next/navigation";
import { Search, Bell, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StateChip } from "@/components/ui/state-chip";

function getBreadcrumb(pathname: string): string[] {
  const parts = pathname
    .replace("/app/", "")
    .split("/")
    .filter(Boolean)
    .map((p) => p.replace(/-/g, " ").replace(/\[.*\]/, ""));
  return parts.length ? parts : ["dashboard"];
}

interface TopbarProps {
  onToggleAudit?: () => void;
}

export function Topbar({ onToggleAudit }: TopbarProps) {
  const pathname = usePathname();
  const crumbs = getBreadcrumb(pathname);

  return (
    <header className="sticky top-0 z-50 bg-bg-root/90 backdrop-blur-xl border-b border-border-default">
      <div className="flex items-center justify-between px-7 h-12">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-medium text-text-secondary">
            <span className="text-syntax-builtin">class</span>{" "}
            <span className="text-text-primary">
              {crumbs.map((c, i) => (
                <span key={i}>
                  {i > 0 && <span className="text-text-muted">.</span>}
                  <span className="capitalize">{c}</span>
                </span>
              ))}
            </span>
            <span className="text-syntax-builtin">(</span>
            <span className="text-syntax-class">View</span>
            <span className="text-syntax-builtin">)</span>
            <span className="text-text-muted">:</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="hidden md:flex items-center gap-1.5 mr-2">
            <StateChip state="raw_signal" />
            <span className="text-text-muted text-[0.6rem]">→</span>
            <StateChip state="qualified_account" />
            <span className="text-text-muted text-[0.6rem]">→</span>
            <StateChip state="contacted" />
            <span className="text-text-muted text-[0.6rem]">→</span>
            <StateChip state="paid" />
            <span className="text-text-muted text-[0.6rem]">→</span>
            <StateChip state="activated" />
          </div>

          <div className="relative hidden lg:block">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <Input
              placeholder="Search accounts, signals..."
              className="pl-8 w-52 h-7 text-[0.68rem]"
            />
          </div>

          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Bell size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onToggleAudit}
          >
            <Activity size={14} />
          </Button>
        </div>
      </div>
    </header>
  );
}
