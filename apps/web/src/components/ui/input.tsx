"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-8 w-full rounded-lg border border-border-default bg-bg-input px-3 py-1",
        "font-mono text-xs text-text-primary placeholder:text-text-muted",
        "transition-colors duration-200",
        "focus:outline-none focus:border-accent-blue-bright focus:ring-1 focus:ring-accent-blue-bright/30",
        "disabled:cursor-not-allowed disabled:opacity-40",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
