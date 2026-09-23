"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DigitalTwinViewer } from "@/components/twin/digital-twin-viewer";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { Badge } from "@/components/ui/badge";
import { cn, formatClock } from "@/lib/utils";

export function TraceView() {
  const params = useSearchParams();
  const requested = params.get("mention");
  const { mentions } = useDashboard();
  const initial = mentions.some((mention) => mention.id === requested) ? requested : mentions[0].id;
  const [activeId, setActiveId] = useState(initial);

  useEffect(() => {
    if (requested && mentions.some((mention) => mention.id === requested)) {
      setActiveId(requested);
    }
  }, [requested, mentions]);
  const active = useMemo(
    () => mentions.find((mention) => mention.id === activeId) ?? mentions[0],
    [activeId, mentions],
  );

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-violet">Digital Twin</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Trace the page, not just the quote.</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Pick a mention. Walk alert, translation, OCR text, and the original page. The ids under the panel
          are the chain of custody.
        </p>
      </header>
      <div className="grid items-start gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <ul className="max-h-[70vh] space-y-2 overflow-auto pr-1">
          {mentions.map((mention) => (
            <li key={mention.id}>
              <button
                type="button"
                onClick={() => setActiveId(mention.id)}
                className={cn(
                  "w-full rounded-xl border px-3 py-3 text-left",
                  mention.id === active.id
                    ? "border-[#7C3AED]/40 bg-accent shadow-soft"
                    : "border-border bg-card hover:border-foreground/15",
                )}
              >
                <span className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>{formatClock(mention.detectedAt)}</span>
                  <Badge variant={mention.sentiment} className="capitalize">
                    {mention.sentiment}
                  </Badge>
                </span>
                <span className="mt-1 block text-sm font-medium leading-snug">{mention.headline}</span>
                <span className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                  <span>
                    {mention.publication} · {mention.language}
                  </span>
                  {mention.sampleTrace && <Badge variant="violet">Uploaded</Badge>}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <DigitalTwinViewer mention={active} />
      </div>
    </div>
  );
}
