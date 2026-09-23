"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, FileText, Loader2, Upload } from "lucide-react";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PAGE_LANGUAGES } from "@/lib/languages";
import type { NewsBrief } from "@/lib/news-brief";
import { readNewsBrief } from "@/lib/read-pdf";
import { renderInLanguage } from "@/lib/translate";
import type { Language } from "@/types";
import { formatBytes, hasPdfSignature, isAllowedPdfCandidate, pdfSizeLimit } from "@/lib/uploaded-mention";
import { cn } from "@/lib/utils";

const STEPS = ["Checking the PDF", "Reading the page", "Scoring sentiment"] as const;

type Phase = "idle" | "processing" | "success";

export function UploadEpaperDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const { addUpload, updateMention } = useDashboard();
  const inputRef = useRef<HTMLInputElement>(null);
  const runId = useRef(0);
  const pending = useRef<number | null>(null);
  const dragDepth = useRef(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileLabel, setFileLabel] = useState<{ name: string; size: number } | null>(null);
  const [step, setStep] = useState(0);
  const [live, setLive] = useState("");
  const [language, setLanguage] = useState<Language | "detect">("detect");
  const wasOpen = useRef(open);

  if (open && !wasOpen.current) {
    wasOpen.current = true;
    if (phase !== "idle" || error || fileLabel || dragging || step !== 0 || live || language !== "detect") {
      setPhase("idle");
      setDragging(false);
      setError(null);
      setFileLabel(null);
      setStep(0);
      setLive("");
      setLanguage("detect");
    }
  }
  if (!open) wasOpen.current = false;

  function clearPending() {
    if (pending.current !== null) {
      window.clearTimeout(pending.current);
      pending.current = null;
    }
  }

  useEffect(() => {
    if (open) return;
    runId.current += 1;
    if (pending.current !== null) {
      window.clearTimeout(pending.current);
      pending.current = null;
    }
    dragDepth.current = 0;
  }, [open]);

  function close() {
    onOpenChange(false);
  }

  async function acceptFile(file: File | undefined) {
    if (!file || phase !== "idle") return;
    const id = ++runId.current;
    setError(null);
    setDragging(false);
    dragDepth.current = 0;

    if (!isAllowedPdfCandidate(file)) {
      setError("Only PDF files can be uploaded.");
      setLive("Only PDF files can be uploaded.");
      return;
    }
    if (file.size === 0) {
      setError("That PDF is empty.");
      setLive("That PDF is empty.");
      return;
    }
    if (file.size > pdfSizeLimit()) {
      setError("Choose a PDF under 32 MB.");
      setLive("Choose a PDF under 32 MB.");
      return;
    }

    setFileLabel({ name: file.name, size: file.size });
    setPhase("processing");
    setStep(0);
    setLive(`Checking ${file.name}`);

    const signed = await hasPdfSignature(file);
    if (runId.current !== id) return;
    if (!signed) {
      setPhase("idle");
      setFileLabel(null);
      setError("That file isn’t a PDF. Choose an ePaper export.");
      setLive("That file isn’t a PDF.");
      return;
    }

    await wait(reduce ? 80 : 220);
    if (runId.current !== id) return;
    setStep(1);
    setLive(STEPS[1]);

    let brief: NewsBrief | null = null;
    try {
      brief = await readNewsBrief(file, language === "detect" ? undefined : language);
    } catch {
      brief = null;
    }
    if (runId.current !== id) return;
    if (!brief) {
      setPhase("idle");
      setFileLabel(null);
      setError("That PDF could not be read. Try another export.");
      setLive("That PDF could not be read.");
      return;
    }
    setStep(2);
    setLive(STEPS[2]);
    await wait(reduce ? 80 : 240);
    if (runId.current !== id) return;

    const mention = addUpload(file, brief);
    if (language !== "detect") {
      setLive(`Translating into ${language}`);
      try {
        updateMention(mention.id, await renderInLanguage(mention, language));
      } catch {
        if (runId.current !== id) return;
        setPhase("idle");
        setFileLabel(null);
        setError(`Could not show this page in ${language}.`);
        setLive(`Could not show this page in ${language}.`);
        return;
      }
    }
    if (runId.current !== id) return;
    setPhase("success");
    setLive(`${file.name} is ready. Opening the summary.`);
    clearPending();
    pending.current = window.setTimeout(() => {
      pending.current = null;
      if (runId.current !== id) return;
      router.push(`/dashboard/trace?mention=${mention.id}`);
      onOpenChange(false);
    }, reduce ? 420 : 980);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-xl"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          dragDepth.current = 0;
          setDragging(false);
          const file = event.dataTransfer.files?.[0];
          void acceptFile(file);
        }}
      >
        <DialogHeader>
          <DialogTitle>Upload ePaper</DialogTitle>
          <DialogDescription>
            Add a PDF from this browser. PrintPulse reads the page, then opens a short summary, the sentiment, and the original file.
          </DialogDescription>
        </DialogHeader>
        <p className="sr-only" aria-live="polite">
          {live}
        </p>
        <AnimatePresence mode="wait" initial={false}>
          {phase === "idle" ? (
            <motion.div
              key="idle"
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                onDragEnter={(event) => {
                  event.preventDefault();
                  dragDepth.current += 1;
                  setDragging(true);
                }}
                onDragOver={(event) => event.preventDefault()}
                onDragLeave={(event) => {
                  event.preventDefault();
                  dragDepth.current -= 1;
                  if (dragDepth.current <= 0) {
                    dragDepth.current = 0;
                    setDragging(false);
                  }
                }}
                className={cn(
                  "flex w-full flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-10 text-center transition-colors duration-200",
                  dragging
                    ? "border-[#7C3AED] bg-accent shadow-glow"
                    : error
                      ? "border-destructive/50 bg-card"
                      : "border-border bg-muted/40 hover:border-[#7C3AED]/50 hover:bg-accent/60",
                )}
              >
                <span className="flex size-12 items-center justify-center rounded-2xl bg-card text-[#7C3AED] shadow-soft dark:text-brand-violet">
                  <Upload className="size-5" />
                </span>
                <span className="mt-4 text-sm font-medium">
                  {dragging ? "Drop the PDF" : "Drag a PDF here"}
                </span>
                <span className="mt-1 text-sm text-muted-foreground">or click to choose a file</span>
                <span className="mt-4 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  PDF only · 32 MB · this session
                </span>
              </button>
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="sr-only"
                tabIndex={-1}
                aria-label="Choose a PDF"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  void acceptFile(file);
                }}
              />
              <label htmlFor="upload-ocr-language" className="mt-4 block text-xs font-medium text-muted-foreground">
                OCR language
                <select
                  id="upload-ocr-language"
                  value={language}
                  onChange={(event) => setLanguage(event.target.value as Language | "detect")}
                  className="mt-1.5 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground"
                >
                  <option value="detect">Detect from the page</option>
                  {PAGE_LANGUAGES.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.id} · {item.nativeName}
                    </option>
                  ))}
                </select>
              </label>
              {error && (
                <p role="alert" className="mt-3 text-sm text-destructive">
                  {error}
                </p>
              )}
            </motion.div>
          ) : (
            <motion.div
              key={phase}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4"
            >
              {fileLabel && (
                <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 shadow-soft">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-[#7C3AED] dark:text-brand-violet">
                    <FileText className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{fileLabel.name}</span>
                    <span className="text-xs text-muted-foreground">{formatBytes(fileLabel.size)}</span>
                  </span>
                </div>
              )}
              {phase === "processing" ? (
                <>
                  <div className="h-1 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-[#7C3AED] transition-all duration-500 ease-out"
                      style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                    />
                  </div>
                  <ol className="space-y-2">
                    {STEPS.map((label, index) => {
                      const done = index < step;
                      const current = index === step;
                      return (
                        <li key={label} className="flex items-center gap-2.5 text-sm">
                          <span
                            className={cn(
                              "flex size-5 items-center justify-center rounded-full",
                              done || current ? "text-[#7C3AED] dark:text-brand-violet" : "text-muted-foreground",
                            )}
                          >
                            {done ? (
                              <Check className="size-3.5" />
                            ) : current ? (
                              <Loader2 className={cn("size-3.5", !reduce && "animate-spin")} />
                            ) : (
                              <span className="size-1.5 rounded-full bg-border" />
                            )}
                          </span>
                          <span className={current ? "font-medium" : "text-muted-foreground"}>{label}</span>
                        </li>
                      );
                    })}
                  </ol>
                </>
              ) : (
                <div className="flex items-start gap-3 rounded-xl border border-[#7C3AED]/20 bg-accent px-3 py-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#7C3AED] text-white">
                    <Check className="size-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-[#4C1D95] dark:text-accent-foreground">
                      Page is on the desk
                    </span>
                    <span className="mt-0.5 block text-sm text-[#4C1D95]/80 dark:text-accent-foreground/80">
                      Opening the summary…
                    </span>
                  </span>
                </div>
              )}
              {phase === "processing" && (
                <button type="button" onClick={close} className="text-xs font-medium text-muted-foreground hover:text-foreground">
                  Cancel
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}
