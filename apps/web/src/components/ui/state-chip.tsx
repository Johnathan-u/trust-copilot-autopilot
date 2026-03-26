"use client";

import { cn } from "@/lib/utils";
import { STATE_COLORS } from "@/lib/constants";

interface StateChipProps {
  state: string;
  className?: string;
}

export function StateChip({ state, className }: StateChipProps) {
  const color = STATE_COLORS[state] || "#555570";
  return (
    <span
      className={cn(
        "inline-flex items-center font-mono text-[0.62rem] font-semibold px-2 py-0.5 rounded",
        className
      )}
      style={{
        color,
        background: `${color}15`,
        border: `1px solid ${color}30`,
      }}
    >
      {state.replace(/_/g, " ")}
    </span>
  );
}
