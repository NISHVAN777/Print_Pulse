"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { formatBytes } from "@/lib/uploaded-mention";
import { cn, formatClock } from "@/lib/utils";

export function RecentUploads({
  variant,
  onNavigate,
}: {
  variant: "sidebar" | "panel";
  onNavigate?: () => void;
}) {
  const { uploads } = useDashboard();
  const sidebar = variant === "sidebar";

  return (
    <section className={cn(sidebar ? "shrink-0 border-t border-border px-3 py-3" : "rounded-xl border border-border bg-card p-4 shadow-soft")}>
      <div className={cn("flex items-baseline justify-between gap-3", sidebar ? "px-2" : "")}>
        <h2 className={cn(sidebar ? "text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-violet" : "font-semibold")}>
          Recent uploads
        </h2>
        {!sidebar && <p className="text-xs text-muted-foreground">This session</p>}
      </div>
      {uploads.length === 0 ? (
        <p className={cn("text-muted-foreground", sidebar ? "px-2 pt-2 text-xs leading-relaxed" : "mt-2 text-sm")}>
          {sidebar
            ? "PDFs you add from the top bar show up here."
            : "No PDFs uploaded this session. Use Upload PDF in the top bar."}
        </p>
      ) : (
        <ul className={cn("space-y-1", sidebar ? "mt-2 max-h-40 overflow-auto" : "mt-3")}>
          {uploads.map((upload) => (
            <li key={upload.id}>
              <Link
                href={`/dashboard/trace?mention=${upload.mentionId}`}
                onClick={onNavigate}
                title={upload.fileName}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg text-left transition-colors hover:bg-muted",
                  sidebar ? "px-2 py-1.5" : "px-2 py-2",
                )}
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-accent text-[#7C3AED] dark:text-brand-violet">
                  <FileText className="size-3.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn("block truncate font-medium", sidebar ? "text-xs" : "text-sm")}>{upload.fileName}</span>
                  <span className="block text-[11px] text-muted-foreground">
                    {formatClock(upload.uploadedAt)}
                    {sidebar ? "" : ` · ${formatBytes(upload.sizeBytes)}`}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
