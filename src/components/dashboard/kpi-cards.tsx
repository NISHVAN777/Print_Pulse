"use client";

import { Bell, Gauge, Languages, Newspaper } from "lucide-react";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { dayKey } from "@/lib/utils";
import { TODAY } from "@/data/mock";

export function KpiCards() {
  const { mentions, threshold } = useDashboard();
  const today = mentions.filter((mention) => dayKey(mention.detectedAt) === TODAY);
  const alerts = today.filter((mention) => mention.sentiment === "negative" || mention.confidence < threshold);
  const languages = new Set(today.map((mention) => mention.language)).size;
  const confidence = today.length
    ? Math.round(today.reduce((sum, mention) => sum + mention.confidence, 0) / today.length)
    : 0;

  const cards = [
    { label: "Mentions today", value: String(today.length), hint: "Across the morning window", icon: Newspaper },
    { label: "Alerts", value: String(alerts.length), hint: "Negative or below the review line", icon: Bell },
    { label: "Languages covered", value: String(languages), hint: "On today’s detected pages", icon: Languages },
    { label: "Confidence score", value: `${confidence}%`, hint: "Mean across today’s mentions", icon: Gauge },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article key={card.label} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-medium text-muted-foreground">{card.label}</p>
            <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-[#7C3AED] dark:text-brand-violet">
              <card.icon className="size-4" />
            </span>
          </div>
          <p className="mt-5 text-3xl font-semibold tracking-[-0.04em]">{card.value}</p>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{card.hint}</p>
        </article>
      ))}
    </div>
  );
}
