"use client";

import { LANGUAGES } from "@/data/mock";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { Button } from "@/components/ui/button";

const SENTIMENTS = ["all", "positive", "neutral", "negative"] as const;
const DATES = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "all", label: "All dates" },
] as const;

export function MentionFilters() {
  const { filters, setFilters, resetFilters, sources } = useDashboard();
  const publications = Array.from(new Set(sources.map((source) => source.publication)));

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-5">
      <div className="flex flex-wrap gap-2">
        {DATES.map((date) => (
          <FilterChip
            key={date.id}
            active={filters.date === date.id}
            onClick={() => setFilters({ date: date.id })}
            label={date.label}
          />
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <label className="space-y-1 text-xs font-medium text-muted-foreground">
          Language
          <select
            className="mt-1.5 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground"
            value={filters.language}
            onChange={(event) =>
              setFilters({ language: event.target.value as typeof filters.language })
            }
          >
            <option value="all">All languages</option>
            {LANGUAGES.map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-xs font-medium text-muted-foreground">
          Sentiment
          <select
            className="mt-1.5 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm capitalize text-foreground"
            value={filters.sentiment}
            onChange={(event) =>
              setFilters({ sentiment: event.target.value as typeof filters.sentiment })
            }
          >
            {SENTIMENTS.map((sentiment) => (
              <option key={sentiment} value={sentiment} className="capitalize">
                {sentiment === "all" ? "All sentiments" : sentiment}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-xs font-medium text-muted-foreground">
          Source
          <select
            className="mt-1.5 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground"
            value={filters.source}
            onChange={(event) => setFilters({ source: event.target.value })}
          >
            <option value="all">All sources</option>
            {publications.map((publication) => (
              <option key={publication} value={publication}>
                {publication}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={resetFilters}>
          Reset filters
        </Button>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        active ? "bg-[#0B1120] text-white dark:bg-white dark:text-[#0B1120]" : "bg-secondary text-secondary-foreground hover:bg-muted"
      }`}
    >
      {label}
    </button>
  );
}
