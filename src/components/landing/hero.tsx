"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Bell, FileImage, Languages, ScanText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEarlyAccess } from "@/components/site/early-access";
import { MENTIONS } from "@/data/mock";
import { cn } from "@/lib/utils";

const STAGES = [
  {
    label: "Page",
    icon: FileImage,
    kicker: "06:05 · Dainik Jagran, Lucknow",
    title: "City edition, page 7",
    body: "The PDF lands as a scan. There is no text layer to search.",
  },
  {
    label: "OCR",
    icon: ScanText,
    kicker: "Hindi · column 2",
    title: "पेयू को भुगतान एग्रीगेटर लाइसेंस के लिए फिर आवेदन करना होगा",
    body: "The brand name is held exactly as it was printed.",
  },
  {
    label: "English",
    icon: Languages,
    kicker: "Entities preserved",
    title: "RBI asks PayU to simplify its structure and reapply",
    body: "PayU, RBI, and Lucknow survive the translation.",
  },
  {
    label: "Alert",
    icon: Bell,
    kicker: "06:12 · WhatsApp and Slack",
    title: "Negative · 91% confidence · 7 minutes",
    body: "The desk has the mention, and the page is still attached.",
  },
] as const;

export function Hero() {
  const { open } = useEarlyAccess();
  const reduce = useReducedMotion();
  const [stage, setStage] = useState(0);
  const mention = MENTIONS[0];

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => setStage((value) => (value + 1) % STAGES.length), 2800);
    return () => window.clearInterval(id);
  }, [reduce]);

  return (
    <section className="hero-wash relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-16 px-4 pb-24 pt-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-32 lg:pt-28">
        <div>
          <p className="text-[13px] font-medium text-[#1E3A8A] dark:text-brand-violet">
            Regional print intelligence
          </p>
          <h1 className="mt-4 max-w-xl text-4xl font-semibold leading-[1.05] text-[#0B1120] dark:text-foreground sm:text-6xl">
            From regional print to real-time intelligence.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
            PrintPulse reads the scanned morning edition, translates it without losing the brand, and
            sends an alert you can open back to the page. On the stand at 6:05. On the desk at 6:12.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" onClick={() => open("access")}>
              Get early access
            </Button>
            <Button size="lg" variant="outline" onClick={() => open("demo")}>
              Request a demo
            </Button>
          </div>
          <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-border pt-6">
            {[
              ["174M", "Regional readers"],
              ["22", "Languages"],
              ["7 min", "Time to alert"],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="text-xl font-semibold tracking-[-0.04em] text-[#0B1120] dark:text-foreground">{value}</dt>
                <dd className="mt-1 text-xs text-muted-foreground">{label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0B1120] p-3 text-white shadow-lift sm:p-4">
          <div className="flex items-center justify-between px-2 pb-3 pt-1">
            <p className="text-xs font-medium text-white/70">PayU desk · {mention.city}</p>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/70">Live sample</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 px-1">
            {STAGES.map((item, index) => {
              const Icon = item.icon;
              const on = index === stage;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setStage(index)}
                  className={cn(
                    "rounded-lg px-2 py-2 text-[11px] font-medium transition-colors",
                    on ? "bg-white text-[#0B1120]" : "text-white/55 hover:bg-white/5 hover:text-white",
                  )}
                >
                  <Icon className="mx-auto mb-1 size-3.5" />
                  {item.label}
                </button>
              );
            })}
          </div>
          <div className="relative mt-3 min-h-[220px] overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-4 h-1 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full bg-[#7C3AED]"
                animate={{ width: `${((stage + 1) / STAGES.length) * 100}%` }}
                transition={{ duration: 0.35 }}
              />
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={stage}
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.28 }}
              >
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#c4b5fd]">
                  {STAGES[stage].kicker}
                </p>
                <p className="mt-3 font-print text-lg font-medium leading-snug">{STAGES[stage].title}</p>
                <p className="mt-3 text-sm leading-relaxed text-white/65">{STAGES[stage].body}</p>
              </motion.div>
            </AnimatePresence>
          </div>
          <Button
            asChild
            variant="outline"
            className="mt-3 w-full border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"
          >
            <Link href="/dashboard/trace">
              Open this trace
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
