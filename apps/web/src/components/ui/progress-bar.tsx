"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  color,
  className,
  showLabel = false,
}: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-1.5 flex-1 rounded-full bg-bg-input overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${pct}%`,
            background: color || "var(--color-syntax-class)",
          }}
        />
      </div>
      {showLabel && (
        <span className="font-mono text-xs font-semibold text-text-secondary min-w-[2.5rem] text-right">
          {pct}%
        </span>
      )}
    </div>
  );
}
