"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { Badge } from "@/components/ui/badge";
import { formatClock } from "@/lib/utils";
import type { Mention, Sentiment } from "@/types";

const DOT: Record<Sentiment, string> = {
  positive: "bg-emerald-500",
  neutral: "bg-slate-400",
  negative: "bg-rose-500",
};

export function MentionsFeed({ limit }: { limit?: number }) {
  const { filtered, openMention, threshold } = useDashboard();
  const rows = typeof limit === "number" ? filtered.slice(0, limit) : filtered;

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-20 text-center">
        <p className="font-medium">No mentions in this cut.</p>
        <p className="mt-1 text-sm text-muted-foreground">Widen the language, sentiment, source, or date.</p>
      </div>
    );
  }

  return (
    <ul className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      {rows.map((mention) => (
        <li key={mention.id} className="border-b border-border last:border-b-0">
          <article className="group grid gap-4 px-4 py-5 transition-colors hover:bg-muted/60 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:px-5">
            <button type="button" onClick={() => openMention(mention.id)} className="text-left sm:contents">
              <div className="pt-0.5 text-xs font-medium tabular-nums text-muted-foreground sm:w-16">
                {formatClock(mention.detectedAt)}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{mention.publication}</span>
                  <span>{mention.city}</span>
                  <span className="text-border">·</span>
                  <span>{mention.language}</span>
                  {mention.sampleTrace && <Badge variant="violet">Uploaded PDF</Badge>}
                  {mention.sourceKind === "email-clipping" && <Badge variant="violet">Email clipping</Badge>}
                  {mention.confidence < threshold && <Badge variant="outline">Needs review</Badge>}
                </div>
                <h3 className="mt-1.5 text-[15px] font-medium leading-snug">{mention.headline}</h3>
                <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{mention.summary}</p>
              </div>
            </button>
            <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-start">
              <Badge variant={mention.sentiment} className="capitalize">
                <span className={`size-1.5 rounded-full ${DOT[mention.sentiment]}`} />
                {mention.sentiment}
              </Badge>
              <div className="flex items-center gap-2">
                <div className="h-1 w-14 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-[#1E3A8A] dark:bg-[#c4b5fd]" style={{ width: `${mention.confidence}%` }} />
                </div>
                <span className="text-[11px] tabular-nums text-muted-foreground">{mention.confidence}%</span>
              </div>
              <Link
                href={`/dashboard/trace?mention=${mention.id}`}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#1E3A8A] hover:underline dark:text-brand-violet"
              >
                Trace
                <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}

export function SentimentMix({ mentions }: { mentions: Mention[] }) {
  const total = mentions.length || 1;
  const counts = {
    positive: mentions.filter((item) => item.sentiment === "positive").length,
    neutral: mentions.filter((item) => item.sentiment === "neutral").length,
    negative: mentions.filter((item) => item.sentiment === "negative").length,
  };
  return (
    <div className="space-y-3.5">
      {(Object.keys(counts) as Array<keyof typeof counts>).map((key) => (
        <div key={key}>
          <div className="mb-1.5 flex justify-between text-xs capitalize">
            <span className="inline-flex items-center gap-2">
              <span className={`size-1.5 rounded-full ${DOT[key]}`} />
              {key}
            </span>
            <span className="tabular-nums text-muted-foreground">{counts[key]}</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-secondary">
            <div
              className={key === "positive" ? "h-full bg-emerald-500" : key === "negative" ? "h-full bg-rose-500" : "h-full bg-slate-400"}
              style={{ width: `${(counts[key] / total) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
