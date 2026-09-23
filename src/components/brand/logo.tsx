import { cn } from "@/lib/utils";

export function Logo({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        aria-hidden
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#1E3A8A] text-[13px] font-semibold tracking-tight text-white shadow-soft dark:bg-white dark:text-[#0B1120]",
          markClassName,
        )}
      >
        P
      </span>
      <span className="text-[15px] font-semibold tracking-[-0.03em]">PrintPulse</span>
    </span>
  );
}
