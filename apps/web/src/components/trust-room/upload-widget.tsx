"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";

type FileStatus = "uploading" | "complete" | "failed" | "waiting";

type QueuedFile = {
  id: string;
  name: string;
  sizeLabel: string;
  ext: "pdf" | "docx" | "xlsx" | "png" | "jpg";
  progress: number;
  status: FileStatus;
};

const ACCEPTED = ".pdf, .docx, .xlsx, .png, .jpg";

const initialQueue: QueuedFile[] = [
  {
    id: "1",
    name: "soc2-report-2025.pdf",
    sizeLabel: "2.4 MB",
    ext: "pdf",
    progress: 100,
    status: "complete",
  },
  {
    id: "2",
    name: "security-policy-v3.docx",
    sizeLabel: "890 KB",
    ext: "docx",
    progress: 67,
    status: "uploading",
  },
  {
    id: "3",
    name: "pentest-results.pdf",
    sizeLabel: "1.1 MB",
    ext: "pdf",
    progress: 0,
    status: "waiting",
  },
];

function FileTypeIcon({ ext }: { ext: QueuedFile["ext"] }) {
  const label = ext.toUpperCase();
  return (
    <span
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-border-default",
        "font-mono text-[0.55rem] font-bold tracking-tight",
        ext === "pdf" && "bg-accent-red/10 text-accent-red",
        ext === "docx" && "bg-syntax-param/10 text-syntax-param",
        ext === "xlsx" && "bg-accent-green/10 text-accent-green",
        (ext === "png" || ext === "jpg") && "bg-syntax-keyword/10 text-syntax-keyword"
      )}
      aria-hidden
    >
      {label}
    </span>
  );
}

function statusLabel(status: FileStatus) {
  switch (status) {
    case "uploading":
      return "uploading";
    case "complete":
      return "complete";
    case "failed":
      return "failed";
    case "waiting":
      return "waiting";
    default:
      return status;
  }
}

function statusClass(status: FileStatus) {
  switch (status) {
    case "complete":
      return "text-accent-green";
    case "uploading":
      return "text-syntax-param";
    case "failed":
      return "text-accent-red";
    case "waiting":
      return "text-text-muted";
    default:
      return "text-text-secondary";
  }
}

export function UploadWidget() {
  const [isDragging, setIsDragging] = useState(false);
  const [queue, setQueue] = useState<QueuedFile[]>(initialQueue);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const simulateDrop = useCallback(() => {
    const id = `drop-${Date.now()}`;
    setQueue((prev) => [
      ...prev,
      {
        id,
        name: `upload-${prev.length + 1}.pdf`,
        sizeLabel: "420 KB",
        ext: "pdf",
        progress: 0,
        status: "waiting",
      },
    ]);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      simulateDrop();
    },
    [simulateDrop]
  );

  function handleUploadAll() {
    setQueue((prev) =>
      prev.map((f) => {
        if (f.status === "waiting") {
          return { ...f, status: "uploading" as const, progress: 12 };
        }
        return f;
      })
    );
  }

  function handleClearCompleted() {
    setQueue((prev) => prev.filter((f) => f.status !== "complete"));
  }

  return (
    <div className="space-y-4 font-sans">
      <div
        role="button"
        tabIndex={0}
        onClick={() => simulateDrop()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            simulateDrop();
          }
        }}
        className={cn(
          "flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors",
          "border-border-default bg-bg-editor",
          isDragging && "border-syntax-param bg-bg-card-hover"
        )}
      >
        <p className="font-mono text-sm font-semibold text-text-primary">
          Drop files to upload
        </p>
        <p className="mt-2 text-xs text-text-secondary">or click to browse (simulated)</p>
        <p className="mt-4 font-mono text-[0.65rem] text-text-muted">
          Accepted: {ACCEPTED}
        </p>
      </div>

      {queue.length > 0 && (
        <ul className="space-y-3">
          {queue.map((file) => (
            <li
              key={file.id}
              className="rounded-lg border border-border-default bg-bg-card px-4 py-3"
            >
              <div className="flex gap-3">
                <FileTypeIcon ext={file.ext} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="truncate font-mono text-xs font-medium text-text-primary">
                      {file.name}
                    </p>
                    <span className="font-mono text-[0.65rem] text-text-muted">
                      {file.sizeLabel}
                    </span>
                  </div>
                  <p className={cn("mt-1 font-mono text-[0.6rem] uppercase", statusClass(file.status))}>
                    {statusLabel(file.status)}
                  </p>
                  {(file.status === "uploading" || file.status === "complete") && (
                    <ProgressBar
                      className="mt-2"
                      value={file.status === "complete" ? 100 : file.progress}
                      color={
                        file.status === "complete"
                          ? "var(--color-accent-green)"
                          : "var(--color-syntax-param)"
                      }
                      showLabel={file.status === "uploading"}
                    />
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={handleUploadAll}>
          Upload All
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={handleClearCompleted}>
          Clear Completed
        </Button>
      </div>
    </div>
  );
}
