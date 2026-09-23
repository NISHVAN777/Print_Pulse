"use client";

import { KpiCards } from "@/components/dashboard/kpi-cards";
import { MentionFilters } from "@/components/dashboard/filters";
import { MentionsFeed, SentimentMix } from "@/components/dashboard/mentions-feed";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { Card } from "@/components/ui/card";

export function Overview() {
  const { filtered } = useDashboard();
  const languages = Array.from(new Set(filtered.map((mention) => mention.language)));

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-violet">Morning desk</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">PayU · 23 Sep 2026</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Editions landed from 6:02 AM. First negative alert, Lucknow, was on the desk at 6:12 AM.
          The cards are the full morning. The feed follows the filters.
        </p>
      </header>
      <KpiCards />
      <MentionFilters />
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-semibold">Live mentions</h2>
            <p className="text-xs text-muted-foreground">{filtered.length} in this cut</p>
          </div>
          <MentionsFeed limit={6} />
        </section>
        <aside className="space-y-4">
          <Card className="p-4">
            <h2 className="text-sm font-semibold">Sentiment in view</h2>
            <div className="mt-4">
              <SentimentMix mentions={filtered} />
            </div>
          </Card>
          <Card className="p-4">
            <h2 className="text-sm font-semibold">Languages in view</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {languages.length === 0 && <li className="text-sm text-muted-foreground">None</li>}
              {languages.map((language) => (
                <li key={language} className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium">
                  {language}
                </li>
              ))}
            </ul>
          </Card>
        </aside>
      </div>
    </div>
  );
}
