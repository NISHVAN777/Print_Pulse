"use client";

import { ThemeProvider } from "next-themes";
import { EarlyAccessProvider } from "@/components/site/early-access";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <EarlyAccessProvider>{children}</EarlyAccessProvider>
    </ThemeProvider>
  );
}
