"use client";

import { MentionFilters } from "@/components/dashboard/filters";
import { MentionsFeed } from "@/components/dashboard/mentions-feed";
import { useDashboard } from "@/components/dashboard/dashboard-context";

export function MentionsPage() {
  const { filtered } = useDashboard();
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-violet">Mentions</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Everything the papers said</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {filtered.length} mentions match the filters. Open a row for the alert, or trace it back to the page.
        </p>
      </header>
      <MentionFilters />
      <MentionsFeed />
    </div>
  );
}
