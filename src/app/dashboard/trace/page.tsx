import type { Metadata } from "next";
import { Suspense } from "react";
import { TraceView } from "@/components/dashboard/trace-view";

export const metadata: Metadata = { title: "Digital Twin" };

export default function Page() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Opening the trace…</p>}>
      <TraceView />
    </Suspense>
  );
}
