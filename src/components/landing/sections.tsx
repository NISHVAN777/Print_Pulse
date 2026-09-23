"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Building2,
  EyeOff,
  FileWarning,
  Flag,
  Landmark,
  Languages,
  Link2,
  ScanLine,
  ShieldCheck,
  Siren,
  Timer,
  Users,
} from "lucide-react";
import { Reveal } from "@/components/brand/reveal";
import { DigitalTwinViewer } from "@/components/twin/digital-twin-viewer";
import { Button } from "@/components/ui/button";
import { useEarlyAccess } from "@/components/site/early-access";
import { MENTIONS, PIPELINE } from "@/data/mock";
import { cn } from "@/lib/utils";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[13px] font-medium text-[#7C3AED] dark:text-brand-violet">{children}</p>
  );
}

export function Problem() {
  const cards = [
    {
      icon: EyeOff,
      title: "Majority, ignored",
      body: "About 90% of Indian print volume is Hindi and other vernacular languages. Regional papers reach roughly 174 million people, against about 22 million for English. Most monitoring suites still optimise for English digital text.",
    },
    {
      icon: FileWarning,
      title: "Unsearchable by design",
      body: "Regional ePapers ship as scanned, image-based PDFs. There is no text layer to query. A keyword search never sees the page, so the mention does not exist until a person reads it.",
    },
    {
      icon: ScanLine,
      title: "Manual and slow",
      body: "Teams still download, inspect, and clip by hand. Press-clipping agencies prove the demand, and they still do it with people. Latency is same-day. A mailed JPEG has no audit chain.",
    },
  ];

  return (
    <section id="problem" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <Reveal>
        <Eyebrow>The problem</Eyebrow>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
          Regional print is still a blind spot.
        </h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Brand crises often start where the English tools are not looking. Print readers in India still
          spend close to an hour a day with the paper. That coverage is mostly untracked.
        </p>
      </Reveal>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {cards.map((card, index) => (
          <Reveal key={card.title} delay={index * 0.06}>
            <article className="h-full rounded-2xl border border-border bg-card p-6 shadow-soft transition-shadow hover:shadow-lift">
              <card.icon className="size-5 text-brand-blue" />
              <h3 className="mt-4 text-xl font-semibold">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{card.body}</p>
            </article>
          </Reveal>
        ))}
      </div>
      <Reveal>
        <div className="mt-6 grid gap-4 rounded-2xl border border-border bg-secondary/60 p-6 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold">Enterprise suites</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Meltwater, Talkwalker, Cision, Brandwatch. Strong on digital and social. Weak on scanned
              regional ePapers, and priced out of most Indian desks.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold">Clipping agencies</p>
            <p className="mt-1 text-sm text-muted-foreground">
              RS Press, MPIS and the rest cover real regional print. Sourcing, tagging, and delivery stay
              human. PrintPulse is the workflow layer those two worlds never built.
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export function HowItWorks() {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const step = PIPELINE[active];

  return (
    <section id="how" className="border-y border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <Reveal>
          <Eyebrow>How it works</Eyebrow>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold sm:text-4xl">
            Six steps. One chain of custody.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Text-layer pages are read directly. Image pages go through regional OCR. Every hop keeps an id,
            so the alert can always be opened back to the page.
          </p>
        </Reveal>
        <ol className="mt-12 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {PIPELINE.map((item, index) => {
            const on = index === active;
            return (
              <li key={item.step}>
                <button
                  type="button"
                  onClick={() => setActive(index)}
                  aria-pressed={on}
                  className={cn(
                    "flex h-full w-full flex-col items-start rounded-xl border px-3 py-3 text-left transition-colors",
                    on
                      ? "border-transparent bg-[#0B1120] text-white shadow-soft dark:bg-white dark:text-[#0B1120]"
                      : "border-border bg-background text-foreground hover:border-[#1E3A8A]/30",
                  )}
                >
                  <span className={cn("text-[11px] font-medium", on ? "text-[#c4b5fd] dark:text-[#7C3AED]" : "text-[#7C3AED]")}>
                    {item.step}
                  </span>
                  <span className="mt-2 text-sm font-medium">{item.title}</span>
                </button>
              </li>
            );
          })}
        </ol>
        <AnimatePresence mode="wait">
          <motion.div
            key={step.step}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-3 rounded-2xl border border-border bg-background px-6 py-7 sm:px-8"
          >
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#7C3AED]">Step {step.step}</p>
            <h3 className="mt-2 text-2xl font-semibold">{step.title}</h3>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">{step.body}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

export function DigitalTwinSection() {
  const mention = MENTIONS[0];
  return (
    <section id="twin" className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
      <div className="grid items-start gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <Reveal>
          <Eyebrow>Key innovation</Eyebrow>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            A digital twin for print.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Competitors either digitise the words and lose the page, or clip the page and lose the speed.
            PrintPulse keeps both. Click the chain. The alert, the English, the OCR, and the Lucknow page
            are the same object.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            <li className="flex gap-2"><Link2 className="mt-0.5 size-4 text-brand-violet" /> Verifiable, auditable, and still in context.</li>
            <li className="flex gap-2"><ShieldCheck className="mt-0.5 size-4 text-brand-violet" /> Low-confidence spans are flagged, not hidden.</li>
            <li className="flex gap-2"><Languages className="mt-0.5 size-4 text-brand-violet" /> Built regional-first: Tamil, Hindi, Telugu, Marathi, Bengali, and on.</li>
          </ul>
          <Button asChild className="mt-6">
            <Link href="/dashboard/trace">Trace this alert in the dashboard</Link>
          </Button>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="rounded-3xl border border-border bg-card p-4 shadow-soft sm:p-6 lg:p-8">
            <DigitalTwinViewer mention={mention} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Features() {
  const items = [
    {
      icon: Languages,
      title: "Regional-first",
      body: "OCR and translation are the product, not a language pack bolted onto an English tool.",
    },
    {
      icon: Link2,
      title: "Digital Twin",
      body: "page id, OCR id, translation id, alert id. The chain is the data model, not a screenshot.",
    },
    {
      icon: Flag,
      title: "Confidence-aware",
      body: "Uncertain names, amounts, and lines are marked for a person. Silent errors do not ship.",
    },
    {
      icon: Timer,
      title: "Minutes, not 12–24 hours",
      body: "Detection moves inside the golden hour. The headline metric is time-to-alert.",
    },
    {
      icon: ScanLine,
      title: "The manual grind, removed",
      body: "Download, clip, tag, and mail is the job the pipeline takes. Analysts keep judgment.",
    },
    {
      icon: ShieldCheck,
      title: "Entities stay intact",
      body: "Brand names, people, and places are preserved through translation. PayU does not become a guess.",
    },
  ];

  return (
    <section id="features" className="border-y border-border bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <Reveal>
          <Eyebrow>Why it is different</Eyebrow>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Not an OCR tool. Not a clipping desk. The whole workflow.
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.04}>
              <article className="h-full rounded-2xl border border-border bg-card p-6 shadow-soft">
                <item.icon className="size-5 text-brand-blue" />
                <h3 className="mt-3 font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WhoBenefits() {
  const groups = [
    {
      icon: Users,
      title: "PR and communications agencies",
      body: "Ten to fifty brand accounts. Regional coverage that does not require another analyst per language.",
    },
    {
      icon: Building2,
      title: "Corporate communications",
      body: "FMCG, BFSI, telecom, pharma. Catch the regional narrative before it becomes a national one.",
    },
    {
      icon: Landmark,
      title: "Government and PSU cells",
      body: "Same-day vernacular dossiers for leadership, with the page still attached.",
    },
    {
      icon: Siren,
      title: "Crisis and reputation teams",
      body: "React inside the hour. A 12-hour clipping cycle is how the golden hour gets spent.",
    },
  ];

  return (
    <section id="who" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <Reveal>
        <Eyebrow>Who it is for</Eyebrow>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          The desks that still open the paper by hand.
        </h2>
      </Reveal>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {groups.map((group, index) => (
          <Reveal key={group.title} delay={index * 0.05}>
            <article className="flex h-full gap-4 rounded-2xl border border-border bg-card p-5">
              <group.icon className="mt-0.5 size-5 shrink-0 text-brand-violet" />
              <div>
                <h3 className="font-semibold">{group.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{group.body}</p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

const BEFORE = [
  "An analyst logs in at dawn and downloads PDFs.",
  "Regional coverage is whatever one person had time to read.",
  "A mention surfaces 12 to 24 hours later, if it surfaces.",
  "The clipping is a JPEG in an email, with no path back to the page.",
  "A doubtful translation is delivered as if it were certain.",
];

const AFTER = [
  "Sources ingest themselves. The desk opens alerts, not zip files.",
  "Hindi, Tamil, Telugu and the rest are first-class, every morning.",
  "Time-to-alert is measured in minutes. 6:05 becomes 6:12.",
  "Every alert opens onto its translation, its OCR, and its page.",
  "Low-confidence lines wait for a person. The rest can move.",
];

export function Impact() {
  return (
    <section id="impact" className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <Reveal>
          <Eyebrow>Impact</Eyebrow>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Before the blind spot. After the trace.
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-2xl border border-border bg-background p-6">
              <p className="text-sm font-semibold text-muted-foreground">Before</p>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed">
                {BEFORE.map((line) => (
                  <li key={line} className="border-l-2 border-border pl-3 text-muted-foreground">{line}</li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.06}>
            <div className="h-full rounded-2xl bg-[#0B1120] p-7 text-white shadow-lift">
              <p className="text-sm font-semibold text-white/80">After PrintPulse</p>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed">
                {AFTER.map((line) => (
                  <li key={line} className="border-l-2 border-white/40 pl-3">{line}</li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function RoadmapTeaser() {
  const phases = [
    { when: "Now", title: "Prove the morning", body: "3–5 sources, two Indic scripts, sentiment, one alert channel, and a traceable dashboard." },
    { when: "Next", title: "A real desk", body: "50+ ePapers, more languages, human review, and multi-client accounts for agencies." },
    { when: "Vision", title: "The last blind spot", body: "Regional print becomes searchable, actionable, and traceable. Competitive sets and misinformation tracking sit on the same chain." },
  ];

  return (
    <section id="roadmap" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <Reveal>
        <Eyebrow>Roadmap</Eyebrow>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Regional print → AI → intelligence → alert → action.
        </h2>
      </Reveal>
      <ol className="mt-10 grid gap-4 md:grid-cols-3">
        {phases.map((phase, index) => (
          <Reveal key={phase.when} delay={index * 0.05}>
            <li className="list-none rounded-2xl border border-border bg-card p-6 shadow-soft">
              <p className="text-[13px] font-medium text-[#7C3AED]">{phase.when}</p>
              <h3 className="mt-2 text-xl font-semibold">{phase.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{phase.body}</p>
            </li>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}

export function FinalCta() {
  const { open } = useEarlyAccess();
  return (
    <section className="px-4 pb-20 sm:px-6 lg:px-8">
      <div className="mesh mx-auto max-w-6xl overflow-hidden rounded-3xl px-6 py-14 text-white sm:px-12">
        <Eyebrow>
          <span className="text-[#c4b5fd]">Early access</span>
        </Eyebrow>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
          Put tomorrow’s regional edition on the desk before breakfast.
        </h2>
        <p className="mt-4 max-w-xl text-white/75">
          Bring one brand and two languages. We will run a real page through the twin, not a mock headline.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" onClick={() => open("access")}>Get early access</Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
            onClick={() => open("demo")}
          >
            Request a demo
          </Button>
          <Button asChild size="lg" variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
            <Link href="/dashboard">View the sample desk</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
