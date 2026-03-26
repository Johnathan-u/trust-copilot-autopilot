"use client";

import { cn } from "@/lib/utils";

type AccentColor = "blue" | "green" | "purple" | "orange" | "teal" | "red";

const accentTop: Record<AccentColor, string> = {
  blue: "before:bg-syntax-builtin",
  green: "before:bg-accent-green",
  purple: "before:bg-syntax-keyword",
  orange: "before:bg-accent-orange",
  teal: "before:bg-syntax-class",
  red: "before:bg-accent-red",
};

const valueColor: Record<AccentColor, string> = {
  blue: "text-syntax-builtin",
  green: "text-accent-green",
  purple: "text-syntax-keyword",
  orange: "text-accent-orange",
  teal: "text-syntax-class",
  red: "text-accent-red",
};

interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: AccentColor;
  className?: string;
}

export function KpiCard({
  label,
  value,
  sub,
  accent = "blue",
  className,
}: KpiCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border-default bg-bg-editor p-4",
        "before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px]",
        accentTop[accent],
        className
      )}
    >
      <div className="font-mono text-[0.62rem] uppercase tracking-wider text-text-muted mb-1.5">
        {label}
      </div>
      <div
        className={cn(
          "font-mono text-2xl font-bold",
          valueColor[accent]
        )}
      >
        {value}
      </div>
      {sub && (
        <div className="text-xs text-text-muted mt-1">{sub}</div>
      )}
    </div>
  );
}
