import type { Metadata } from "next";
import Link from "next/link";
import { FinalCta } from "@/components/landing/sections";
import { PIPELINE } from "@/data/mock";

export const metadata: Metadata = {
  title: "How it works",
  description: "The PrintPulse pipeline, from scanned ePaper to a traceable alert.",
};

const STACK = [
  { title: "Ingest", body: "Python with Requests and Playwright pulls configured ePaper PDFs. A bureau inbox accepts emailed page photos with a simple sender or subject rule." },
  { title: "OCR", body: "Tesseract, Bhashini, or a cloud OCR service reads Indic scripts. The pipeline first checks whether the PDF page already has a text layer." },
  { title: "Translation", body: "IndicTrans2 plus an LLM pass. The prompt keeps brand names, people, places, and numerals, and marks spans it does not trust." },
  { title: "Intelligence", body: "Keyword and entity match, positive / neutral / negative sentiment, and a confidence score. Alerts fire only when a watched brand is present." },
  { title: "Product", body: "This interface is Next.js, TypeScript, and Tailwind. A production desk would sit on FastAPI, with Postgres for the chain and object storage for page images." },
  { title: "Alerts", body: "WhatsApp and Slack the moment a mention clears the threshold. Email remains the digest for items that need a reviewer." },
];

export default function AboutPage() {
  return (
    <>
      <article className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:py-28">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-violet">About</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          Regional print, made searchable without losing the page.
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
          PrintPulse is an AI workflow for ePapers and regional media monitoring. It does not claim to
          have invented OCR. Indic OCR and translation are finally good enough to build on. The unsolved
          piece is the desk: harvest, orchestrate, trace, and alert.
        </p>

        <h2 className="mt-12 text-2xl font-semibold">The pipeline</h2>
        <ol className="mt-4 space-y-4">
          {PIPELINE.map((step) => (
            <li key={step.step} className="rounded-xl border border-border bg-card p-4">
              <p className="font-mono text-xs text-brand-violet">{step.step}</p>
              <h3 className="mt-1 font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>

        <h2 className="mt-12 text-2xl font-semibold">What the twin actually stores</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Each mention is four linked records: the page image, the OCR text, the English translation, and
          the alert. An auditor never has to trust a summary. They open the id and see the clipping box on
          the edition that was published. Low-confidence names and amounts stay attached to the step that
          produced them, so a reviewer knows what to check.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          The sample desk follows one brand, PayU, across Hindi, Tamil, Telugu, Marathi, Bengali, Gujarati,
          Malayalam, and English editions. The lines are written for this preview. They show the shape of a
          morning monitoring report: what was said, where, with what tone, and how sure the reading is.
        </p>

        <h2 className="mt-12 text-2xl font-semibold">Under the hood</h2>
        <dl className="mt-4 space-y-4">
          {STACK.map((item) => (
            <div key={item.title} className="border-t border-border pt-4">
              <dt className="font-semibold">{item.title}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.body}</dd>
            </div>
          ))}
        </dl>

        <h2 className="mt-12 text-2xl font-semibold">What this preview includes</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          The marketing site, pricing, and this page are the public face. The dashboard is a working sample
          of the desk: filters, a live-style mentions feed, an alert drawer, source toggles, brand keywords,
          and the Digital Twin. Login and signup are interface only. Nothing is sent to a server.
        </p>
        <p className="mt-4">
          <Link href="/dashboard" className="text-sm font-semibold text-brand-blue hover:underline">
            Open the sample dashboard
          </Link>
        </p>
      </article>
      <FinalCta />
    </>
  );
}
