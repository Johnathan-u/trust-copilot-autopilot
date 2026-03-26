"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-mono text-xs font-medium tracking-wide uppercase transition-all duration-200 cursor-pointer disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-accent-blue-bright text-white hover:bg-accent-blue-bright/90 shadow-[0_0_12px_rgba(0,122,204,0.2)]",
        destructive:
          "bg-accent-red/15 text-accent-red border border-accent-red/30 hover:bg-accent-red/25",
        outline:
          "border border-border-default bg-bg-input text-text-secondary hover:bg-bg-card hover:text-text-primary hover:border-border-active",
        ghost:
          "text-text-secondary hover:bg-bg-card hover:text-text-primary",
        success:
          "bg-accent-green-dim text-accent-green border border-accent-green/30 hover:bg-accent-green/20",
      },
      size: {
        default: "h-8 px-4 rounded-lg",
        sm: "h-7 px-3 rounded-md text-[0.65rem]",
        lg: "h-9 px-6 rounded-lg",
        icon: "h-8 w-8 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
