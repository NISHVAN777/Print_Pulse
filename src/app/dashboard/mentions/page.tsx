import type { Metadata } from "next";
import { MentionsPage } from "@/components/dashboard/mentions-page";

export const metadata: Metadata = { title: "Mentions" };

export default function Page() {
  return <MentionsPage />;
}
