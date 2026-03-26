"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { navigation, type NavItem, type NavSection } from "@/config/navigation";
import { Badge } from "@/components/ui/badge";
import { appConfig } from "@/config/env";

function NavItemRow({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const isActive =
    pathname === item.href ||
    item.children?.some((c) => pathname === c.href) ||
    pathname.startsWith(item.href + "/");
  const [expanded, setExpanded] = useState(isActive);
  const Icon = item.icon;

  return (
    <div>
      <div
        className={cn(
          "group flex items-center gap-2.5 px-4 py-2 cursor-pointer transition-all duration-200",
          "border-l-[3px] border-transparent",
          isActive
            ? "bg-glow-blue border-l-accent-blue-bright"
            : "hover:bg-bg-card hover:border-l-border-active"
        )}
        onClick={() => setExpanded(!expanded)}
      >
        <Icon
          size={15}
          className={cn(
            "shrink-0 transition-colors",
            isActive ? "text-syntax-param" : "text-text-muted group-hover:text-text-secondary"
          )}
        />
        <span
          className={cn(
            "flex-1 text-xs font-medium truncate transition-colors",
            isActive ? "text-text-primary" : "text-text-secondary"
          )}
        >
          {item.label}
        </span>
        {item.children && (
          <ChevronRight
            size={12}
            className={cn(
              "shrink-0 text-text-muted transition-transform duration-200",
              expanded && "rotate-90"
            )}
          />
        )}
      </div>
      {item.children && expanded && (
        <div className="ml-[27px] border-l border-border-default">
          {item.children.map((child) => {
            const childActive = pathname === child.href;
            return (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  "block px-4 py-1.5 text-[0.7rem] transition-colors",
                  childActive
                    ? "text-syntax-param font-medium"
                    : "text-text-muted hover:text-text-secondary"
                )}
              >
                {child.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const envVariant =
    appConfig.env === "prod"
      ? "env_prod"
      : appConfig.env === "cert"
        ? "env_cert"
        : "env_dev";

  return (
    <aside className="flex flex-col h-screen w-[260px] bg-bg-sidebar border-r border-border-default sticky top-0 overflow-hidden">
      <div className="px-4 pt-5 pb-3 border-b border-border-default">
        <div className="font-mono text-[0.6rem] font-semibold text-text-muted uppercase tracking-[1.5px] mb-1">
          Operator Console
        </div>
        <div className="flex items-center gap-2">
          <div className="font-mono text-sm font-bold bg-gradient-to-r from-syntax-builtin to-syntax-keyword bg-clip-text text-transparent">
            Trust Copilot
          </div>
          <Badge variant={envVariant as "env_dev" | "env_cert" | "env_prod"}>
            {appConfig.env}
          </Badge>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-1.5">
        {navigation.map((section: NavSection) => (
          <div key={section.title}>
            <div className="px-4 pt-4 pb-1 font-mono text-[0.55rem] font-semibold text-text-muted uppercase tracking-[1px]">
              {section.title}
            </div>
            {section.items.map((item) => (
              <NavItemRow key={item.href} item={item} />
            ))}
          </div>
        ))}
      </nav>

      <div className="px-4 py-3 border-t border-border-default">
        <div className="flex items-center gap-2 text-text-muted">
          <Zap size={12} className="text-syntax-function" />
          <span className="font-mono text-[0.6rem]">
            Autopilot Active
          </span>
          <span className="ml-auto h-2 w-2 rounded-full bg-accent-green animate-pulse" />
        </div>
      </div>
    </aside>
  );
}
