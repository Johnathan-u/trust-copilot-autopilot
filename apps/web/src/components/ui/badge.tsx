"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center font-mono text-[0.6rem] font-semibold px-2 py-0.5 rounded tracking-wider uppercase whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-bg-input text-text-secondary border border-border-default",
        p0: "bg-accent-red/10 text-accent-red",
        p1: "bg-accent-yellow/10 text-accent-yellow",
        success: "bg-accent-green-dim text-accent-green",
        info: "bg-syntax-param/10 text-syntax-param",
        warning: "bg-accent-orange/10 text-accent-orange",
        discovery: "bg-syntax-builtin/10 text-syntax-builtin",
        qualification: "bg-syntax-keyword/10 text-syntax-keyword",
        contact: "bg-syntax-operator/10 text-syntax-operator",
        tech: "bg-syntax-class/10 text-syntax-class",
        route: "bg-syntax-string/10 text-syntax-string",
        env_dev: "bg-syntax-string/15 text-syntax-string border border-syntax-string/30",
        env_cert: "bg-accent-yellow/15 text-accent-yellow border border-accent-yellow/30",
        env_prod: "bg-accent-red/15 text-accent-red border border-accent-red/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
