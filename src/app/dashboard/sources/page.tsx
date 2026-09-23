import type { Metadata } from "next";
import { SourcesPanel } from "@/components/dashboard/sources-panel";

export const metadata: Metadata = { title: "Sources" };

export default function Page() {
  return <SourcesPanel />;
}
