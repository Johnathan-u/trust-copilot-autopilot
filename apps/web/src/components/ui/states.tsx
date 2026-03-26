"use client";

import { Loader2, AlertTriangle, Inbox, RefreshCw, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = "Loading…", className }: LoadingStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 gap-3", className)}>
      <Loader2 size={24} className="text-syntax-builtin animate-spin" />
      <span className="font-mono text-xs text-text-muted">{message}</span>
    </div>
  );
}

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 gap-3", className)}>
      <div className="h-12 w-12 rounded-xl bg-bg-input border border-border-default flex items-center justify-center">
        <Icon size={22} className="text-text-muted" />
      </div>
      <h3 className="font-mono text-sm font-medium text-text-secondary">{title}</h3>
      {description && (
        <p className="text-xs text-text-muted max-w-[280px] text-center leading-relaxed">
          {description}
        </p>
      )}
      {action && (
        <Button variant="outline" size="sm" onClick={action.onClick} className="mt-1">
          {action.label}
        </Button>
      )}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 gap-3", className)}>
      <div className="h-12 w-12 rounded-xl bg-accent-red/10 border border-accent-red/20 flex items-center justify-center">
        <AlertTriangle size={22} className="text-accent-red" />
      </div>
      <h3 className="font-mono text-sm font-medium text-accent-red">{title}</h3>
      <p className="text-xs text-text-muted max-w-[320px] text-center leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-1">
          <RefreshCw size={12} />
          Retry
        </Button>
      )}
    </div>
  );
}

export function SkeletonRow({ cols = 4, className }: { cols?: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-4 px-4 py-3", className)}>
      {Array.from({ length: cols }).map((_, i) => (
        <div
          key={i}
          className="h-3 rounded bg-bg-input animate-pulse"
          style={{ width: `${20 + Math.random() * 30}%` }}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border-default bg-bg-editor p-5 space-y-3",
        className
      )}
    >
      <div className="h-3 w-24 rounded bg-bg-input animate-pulse" />
      <div className="h-6 w-16 rounded bg-bg-input animate-pulse" />
      <div className="h-2 w-32 rounded bg-bg-input animate-pulse" />
    </div>
  );
}
