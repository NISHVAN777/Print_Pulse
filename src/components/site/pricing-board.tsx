"use client";

import { Check } from "lucide-react";
import { TIERS } from "@/data/mock";
import { useEarlyAccess } from "@/components/site/early-access";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PricingBoard() {
  const { open } = useEarlyAccess();

  return (
    <div className="mt-14 grid items-stretch gap-5 lg:grid-cols-3">
      {TIERS.map((tier) => (
        <article
          key={tier.id}
          className={cn(
            "flex flex-col rounded-2xl border p-7 shadow-soft",
            tier.featured
              ? "border-transparent bg-[#0B1120] text-white shadow-lift lg:-my-3 lg:py-10"
              : "border-border bg-card",
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <p className={cn("text-sm font-medium", tier.featured ? "text-white/70" : "text-muted-foreground")}>
              {tier.name}
            </p>
            {tier.featured && (
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white">Most desks</span>
            )}
          </div>
          <p className="mt-6 text-4xl font-semibold tracking-[-0.04em]">{tier.price}</p>
          <p className={cn("mt-1 text-sm", tier.featured ? "text-white/60" : "text-muted-foreground")}>{tier.cadence}</p>
          <p className={cn("mt-5 text-sm leading-relaxed", tier.featured ? "text-white/80" : "text-muted-foreground")}>
            {tier.blurb}
          </p>
          <ul className="mt-8 flex-1 space-y-3 text-sm">
            {tier.features.map((feature) => (
              <li key={feature} className="flex gap-2.5">
                <Check className={cn("mt-0.5 size-4 shrink-0", tier.featured ? "text-[#c4b5fd]" : "text-[#7C3AED]")} />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <Button
            className={cn("mt-8", tier.featured && "bg-white text-[#0B1120] hover:bg-white/90")}
            variant={tier.featured ? "secondary" : "default"}
            onClick={() => open(tier.id === "monitor" ? "access" : "demo")}
          >
            {tier.cta}
          </Button>
        </article>
      ))}
    </div>
  );
}
