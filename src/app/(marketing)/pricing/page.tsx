import type { Metadata } from "next";
import { PricingBoard } from "@/components/site/pricing-board";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Early-access tiers for a regional print monitoring desk.",
};

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <p className="text-[13px] font-medium text-[#7C3AED]">Pricing</p>
      <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
        A desk, not a headcount.
      </h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Illustrative early-access pricing for Indian PR, corporate, and government teams. Enterprise
        suites are usually quote-only. Clipping agencies scale with people. These tiers scale with sources.
      </p>
      <PricingBoard />
    </div>
  );
}
