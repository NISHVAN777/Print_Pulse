import type { Mention } from "@/types";
import { cn, formatDate } from "@/lib/utils";

/**
 * Stand-in for the stored page scan. The violet frame is the clipping
 * the alert was cut from. Production swaps this for the real image.
 */
export function NewspaperPage({ mention, active }: { mention: Mention; active?: boolean }) {
  return (
    <figure
      className={cn(
        "paper-grain relative mx-auto w-full max-w-md overflow-hidden rounded-md text-[#1c140c] shadow-lift",
        active && "ring-2 ring-[#7C3AED] ring-offset-4 ring-offset-background",
      )}
    >
      <figcaption className="sr-only">
        Simulated {mention.publication} page {mention.pageNumber}, {mention.city} edition
      </figcaption>
      <header className="border-b-2 border-[#1c140c] px-4 pb-2.5 pt-4 text-center">
        <p className="font-print text-[1.7rem] font-bold leading-none">{mention.masthead}</p>
        <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-[#5c4a32]">
          {mention.city} · {mention.edition} · {formatDate(mention.publishedAt)} · p.{mention.pageNumber}
        </p>
      </header>
      <div className="grid grid-cols-5 gap-3 px-3 py-3">
        <div className="col-span-2 space-y-1.5 border-r border-[#1c140c]/15 pr-2">
          <div className="h-2 w-4/5 bg-[#1c140c]/80" />
          <div className="space-y-1">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-1.5 bg-[#1c140c]/12" style={{ width: `${92 - (i % 4) * 7}%` }} />
            ))}
          </div>
          <div className="mt-3 h-16 rounded-sm bg-[#1c140c]/8" />
        </div>
        <div className="col-span-3">
          <div className={cn("rounded-sm p-2.5", active ? "bg-[#7C3AED]/10 ring-2 ring-[#7C3AED]" : "bg-[#fffdf8]/50")}>
            <p className="font-print text-[13px] font-bold leading-snug">{mention.nativeHeadline}</p>
            <p className="mt-2 font-print text-[11.5px] leading-[1.55]">{mention.ocrText}</p>
          </div>
          <p className="mt-2 text-[9px] uppercase tracking-[0.14em] text-[#5c4a32]">{mention.column}</p>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-[#1c140c]/10 px-3 py-2 text-[9px] uppercase tracking-[0.14em] text-[#5c4a32]">
        <span className="truncate">{mention.chain.pageId}</span>
        <span>{mention.language}</span>
      </div>
    </figure>
  );
}
