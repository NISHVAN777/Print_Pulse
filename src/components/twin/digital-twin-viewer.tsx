"use client";

import { createContext, useContext, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Bell, FileImage, Languages, ScanText, ShieldAlert } from "lucide-react";
import { useOptionalDashboard } from "@/components/dashboard/dashboard-context";
import { NewspaperPage } from "@/components/twin/newspaper-page";
import { Badge } from "@/components/ui/badge";
import { PAGE_LANGUAGES, nativeNameFor } from "@/lib/languages";
import { renderInLanguage } from "@/lib/translate";
import type { Language, Mention, TwinStage } from "@/types";
import { cn, formatClock, formatDateTime } from "@/lib/utils";

const LocalLanguage = createContext<{
  language: Language;
  setLanguage: (language: Language) => void;
  view: Partial<Mention> | null;
  setView: (view: Partial<Mention> | null) => void;
} | null>(null);

const STAGES: { id: TwinStage; label: string; hint: string; icon: typeof Bell }[] = [
  { id: "alert", label: "Alert", hint: "What reached the desk", icon: Bell },
  { id: "translation", label: "Translation", hint: "English, names kept", icon: Languages },
  { id: "ocr", label: "OCR text", hint: "The scan, as read", icon: ScanText },
  { id: "page", label: "Original page", hint: "The printed edition", icon: FileImage },
];

/**
 * Digital Twin for Print.
 * Four linked records. Selecting one never leaves the others behind.
 */
export function DigitalTwinViewer({
  mention,
  compact = false,
}: {
  mention: Mention;
  compact?: boolean;
}) {
  const [stage, setStage] = useState<TwinStage>("alert");
  const [trackedId, setTrackedId] = useState(mention.id);
  const [localLanguage, setLocalLanguage] = useState<Language>(mention.language);
  const [localView, setLocalView] = useState<Partial<Mention> | null>(null);
  const reduce = useReducedMotion();

  if (mention.id !== trackedId) {
    setTrackedId(mention.id);
    setStage("alert");
    setLocalLanguage(mention.language);
    setLocalView(null);
  }

  const choice = {
    language: localLanguage,
    setLanguage: setLocalLanguage,
    view: localView,
    setView: setLocalView,
  };

  if (mention.previewUrl) {
    return (
      <LocalLanguage.Provider value={choice}>
        <UploadedRead mention={mention} compact={compact} />
      </LocalLanguage.Provider>
    );
  }

  const index = STAGES.findIndex((item) => item.id === stage);

  return (
    <LocalLanguage.Provider value={choice}>
    <div className={cn("flex flex-col", compact ? "gap-4" : "gap-6")}>
      <ol className={cn("grid grid-cols-4 gap-2", compact && "grid-cols-2 sm:grid-cols-4")}>
        {STAGES.map((item, step) => {
          const Icon = item.icon;
          const selected = stage === item.id;
          const done = step < index;
          return (
            <li key={item.id} className="min-w-0">
              <button
                type="button"
                onClick={() => setStage(item.id)}
                aria-pressed={selected}
                className="group flex w-full min-w-0 flex-col items-center gap-2 text-center focus-visible:outline-none"
              >
                <span className="relative flex w-full items-center justify-center">
                  {step > 0 && (
                    <span
                      aria-hidden
                      className={cn(
                        "absolute right-1/2 top-1/2 hidden h-px w-full -translate-y-1/2 sm:block",
                        done || selected ? "bg-[#7C3AED]/50" : "bg-border",
                      )}
                    />
                  )}
                  <span
                    className={cn(
                      "relative z-10 flex size-10 items-center justify-center rounded-full border transition-all duration-200",
                      selected
                        ? "border-transparent bg-[#7C3AED] text-white shadow-glow"
                        : done
                          ? "border-[#7C3AED]/30 bg-accent text-[#7C3AED]"
                          : "border-border bg-card text-muted-foreground group-hover:border-[#7C3AED]/40",
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                </span>
                <span className="min-w-0">
                  <span className={cn("block text-xs font-medium", selected ? "text-foreground" : "text-muted-foreground")}>
                    {item.label}
                  </span>
                  {!compact && (
                    <span className="mt-0.5 hidden text-[11px] text-muted-foreground lg:block">{item.hint}</span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-5">
          <p className="text-xs font-medium text-muted-foreground">
            Step {index + 1} of 4 · {STAGES[index].label}
          </p>
          <p className="truncate pl-4 font-mono text-[11px] text-muted-foreground">
            {mention.chain.alertId}
          </p>
        </div>
        <div className="p-4 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={stage + mention.id}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              {stage === "alert" && <AlertPane mention={mention} />}
              {stage === "translation" && <TranslationPane mention={mention} />}
              {stage === "ocr" && <OcrPane mention={mention} />}
              {stage === "page" && <PagePane mention={mention} compact={compact} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <p className="truncate font-mono text-[11px] text-muted-foreground">
        {mention.chain.alertId} → {mention.chain.translationId} → {mention.chain.ocrId} → {mention.chain.pageId}
      </p>
    </div>
    </LocalLanguage.Provider>
  );
}

const SENTIMENT_LABEL = {
  positive: "Positive",
  neutral: "Neutral",
  negative: "Negative",
} as const;

function useArticle(mention: Mention) {
  const dashboard = useOptionalDashboard();
  const local = useContext(LocalLanguage);
  if (!dashboard && local?.view) return { ...mention, ...local.view, language: local.language };
  return mention;
}

function UploadedRead({ mention, compact }: { mention: Mention; compact?: boolean }) {
  const article = useArticle(mention);
  return (
    <div className={cn("flex flex-col", compact ? "gap-4" : "gap-6")}>
      <section className="rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#7C3AED] dark:text-brand-violet">
          Summary
        </p>
        <p className="mt-3 max-w-2xl text-[15px] leading-7">{article.summary}</p>
        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-4">
          <Badge variant={article.sentiment}>{SENTIMENT_LABEL[article.sentiment]}</Badge>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-[#7C3AED]"
                style={{ width: `${article.confidence}%` }}
              />
            </div>
            <span className="text-sm font-medium tabular-nums">{article.confidence}% confidence</span>
          </div>
        </div>
        {article.reviewFlag && (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{article.reviewFlag}</p>
        )}
      </section>
      <OcrTranslation mention={mention} />
      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
          <p className="text-xs font-medium text-muted-foreground">Original page</p>
          <a
            href={mention.previewUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-medium text-[#1E3A8A] hover:underline dark:text-brand-violet"
          >
            Open PDF
          </a>
        </div>
        <iframe
          title={`${mention.fileName ?? mention.publication} original page`}
          src={mention.previewUrl}
          className={cn("w-full bg-white", compact ? "h-72" : "h-[36rem]")}
        />
      </section>
    </div>
  );
}

function AlertPane({ mention }: { mention: Mention }) {
  const article = useArticle(mention);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={article.sentiment} className="capitalize">
          {article.sentiment}
        </Badge>
        <Badge variant="violet">{article.confidence}% confidence</Badge>
        {mention.channels.map((channel) => (
          <Badge key={channel} variant="outline" className="capitalize">
            {channel}
          </Badge>
        ))}
      </div>
      <h3 className="text-xl font-semibold leading-snug">{article.headline}</h3>
      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{article.summary}</p>
      <dl className="grid grid-cols-2 gap-4 border-t border-border pt-4 text-sm sm:grid-cols-4">
        <Meta label="Detected" value={formatClock(mention.detectedAt)} />
        <Meta label="Published" value={formatClock(mention.publishedAt)} />
        <Meta label="Latency" value={`${mention.latencyMinutes} min`} />
        <Meta label="Source" value={mention.sourceKind === "epaper" ? "ePaper" : "Email clipping"} />
      </dl>
    </div>
  );
}

function TranslationPane({ mention }: { mention: Mention }) {
  const article = useArticle(mention);
  const language = useShownLanguage(mention);
  return (
    <div className="space-y-4">
      <PageLanguageSelect mention={mention} inputId={`translation-language-${mention.id}`} />
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#7C3AED] dark:text-brand-violet">
        Translation · {nativeNameFor(language)} · {mention.chain.translationId}
      </p>
      <p className="max-w-2xl text-[15px] leading-7">{highlightBrand(article.translation, article.brand)}</p>
      {article.reviewFlag && <ReviewNote text={article.reviewFlag} />}
    </div>
  );
}

function OcrPane({ mention }: { mention: Mention }) {
  const article = useArticle(mention);
  const language = useShownLanguage(mention);
  return (
    <div className="space-y-4">
      <PageLanguageSelect mention={mention} inputId={`ocr-language-${mention.id}`} />
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#7C3AED] dark:text-brand-violet">
        {nativeNameFor(language)} · {language} · {mention.chain.ocrId}
      </p>
      <p className="font-print max-w-2xl text-base leading-8">{article.ocrText}</p>
      {article.reviewFlag && <ReviewNote text={article.reviewFlag} />}
    </div>
  );
}

function OcrTranslation({ mention }: { mention: Mention }) {
  const article = useArticle(mention);
  const language = useShownLanguage(mention);
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#7C3AED] dark:text-brand-violet">
          OCR and translation
        </p>
        <PageLanguageSelect mention={mention} inputId={`upload-language-${mention.id}`} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">
            OCR · {nativeNameFor(language)}
          </p>
          <p className="font-print mt-2 max-h-48 overflow-auto text-sm leading-7">{article.ocrText}</p>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">
            Translation · {nativeNameFor(language)}
          </p>
          <p className="mt-2 max-h-48 overflow-auto text-sm leading-7">{article.translation}</p>
        </div>
      </div>
    </section>
  );
}

function useShownLanguage(mention: Mention) {
  const dashboard = useOptionalDashboard();
  const local = useContext(LocalLanguage);
  return dashboard ? mention.language : (local?.language ?? mention.language);
}

function PageLanguageSelect({ mention, inputId }: { mention: Mention; inputId: string }) {
  const dashboard = useOptionalDashboard();
  const local = useContext(LocalLanguage);
  const language = useShownLanguage(mention);
  const [trackedId, setTrackedId] = useState(mention.id);
  const [pending, setPending] = useState<Language | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const run = useRef(0);

  if (mention.id !== trackedId) {
    setTrackedId(mention.id);
    setPending(null);
    setBusy(false);
    setError(null);
  }

  async function choose(next: Language) {
    if (next === (pending ?? language) || busy) return;
    setError(null);
    const request = ++run.current;
    setPending(next);
    setBusy(true);
    try {
      const patch = await renderInLanguage(mention, next);
      if (run.current !== request) return;
      if (dashboard) dashboard.updateMention(mention.id, patch);
      else {
        local?.setLanguage(next);
        local?.setView(patch);
      }
    } catch {
      if (run.current !== request) return;
      setError(`Could not show this page in ${next}.`);
    } finally {
      if (run.current === request) {
        setPending(null);
        setBusy(false);
      }
    }
  }

  return (
    <div className="max-w-xs">
      <label htmlFor={inputId} className="text-xs font-medium text-muted-foreground">
        OCR language
      </label>
      <select
        id={inputId}
        value={pending ?? language}
        disabled={busy}
        onChange={(event) => void choose(event.target.value as Language)}
        className="mt-1.5 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground disabled:opacity-60"
      >
        {PAGE_LANGUAGES.map((item) => (
          <option key={item.id} value={item.id}>
            {item.id} · {item.nativeName}
          </option>
        ))}
      </select>
      {busy && <p className="mt-1.5 text-xs text-muted-foreground">Translating into {pending ?? language}…</p>}
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function PagePane({ mention, compact }: { mention: Mention; compact?: boolean }) {
  return (
    <div className={cn("grid items-start gap-6", !compact && "lg:grid-cols-[minmax(0,18rem)_1fr]")}>
      {mention.previewUrl ? (
        <div className="overflow-hidden rounded-md bg-white shadow-lift ring-2 ring-[#7C3AED] ring-offset-4 ring-offset-background">
          <iframe
            title={`${mention.fileName ?? mention.publication} original page`}
            src={mention.previewUrl}
            className={cn("w-full", compact ? "h-64" : "h-[28rem]")}
          />
        </div>
      ) : (
        <NewspaperPage mention={mention} active />
      )}
      <div className="space-y-3 text-sm">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#7C3AED] dark:text-brand-violet">
          {mention.chain.pageId}
        </p>
        <p className="text-base font-semibold">
          {mention.publication}
          <span className="font-normal text-muted-foreground"> · {mention.city}</span>
        </p>
        {mention.previewUrl ? (
          <>
            <p className="max-w-md leading-relaxed text-muted-foreground">
              {mention.fileName ? `${mention.fileName}. ` : ""}
              This is the PDF added from the desk. Sample OCR and translation sit on the earlier steps.
            </p>
            <p className="max-w-md leading-relaxed text-muted-foreground">
              The file stays in this browser. The id above is what an auditor would open.
            </p>
            <a
              href={mention.previewUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex text-sm font-medium text-[#1E3A8A] hover:underline dark:text-brand-violet"
            >
              Open PDF in a new tab
            </a>
          </>
        ) : (
          <>
            <p className="max-w-md leading-relaxed text-muted-foreground">
              {mention.edition} edition, page {mention.pageNumber}. Published {formatDateTime(mention.publishedAt)}.
              The violet frame is the clipping this alert was cut from.
            </p>
            <p className="max-w-md leading-relaxed text-muted-foreground">
              In production this is the stored scan. The id above is what an auditor opens.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function ReviewNote({ text }: { text: string }) {
  return (
    <p className="flex max-w-2xl gap-2 rounded-xl border border-amber-200/80 bg-amber-50 px-3 py-2.5 text-sm leading-relaxed text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
      <ShieldAlert className="mt-0.5 size-4 shrink-0" />
      <span>{text}</span>
    </p>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}

function highlightBrand(text: string, brand: string) {
  const parts = text.split(new RegExp(`(${brand})`, "gi"));
  return parts.map((part, index) =>
    part.toLowerCase() === brand.toLowerCase() ? (
      <mark key={index} className="rounded bg-[#EDE9FE] px-0.5 text-[#4C1D95] dark:bg-[#2e1065] dark:text-[#ddd6fe]">
        {part}
      </mark>
    ) : (
      <span key={index}>{part}</span>
    ),
  );
}
