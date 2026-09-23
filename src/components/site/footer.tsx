import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Regional print, turned into intelligence you can audit. From the morning ePaper to a traced alert
            in minutes.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Product</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link className="hover:text-foreground" href="/#twin">Digital Twin</Link></li>
            <li><Link className="hover:text-foreground" href="/dashboard">Sample dashboard</Link></li>
            <li><Link className="hover:text-foreground" href="/pricing">Pricing</Link></li>
            <li><Link className="hover:text-foreground" href="/about">How it works</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Desk</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link className="hover:text-foreground" href="/login">Log in</Link></li>
            <li><Link className="hover:text-foreground" href="/signup">Create account</Link></li>
            <li><Link className="hover:text-foreground" href="/dashboard/trace">Trace a mention</Link></li>
            <li><Link className="hover:text-foreground" href="/dashboard/sources">Sources</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted-foreground sm:px-6 lg:px-8">
          PrintPulse sample interface. Newspaper lines in the dashboard are original demo clippings, not reproduced articles.
        </p>
      </div>
    </footer>
  );
}
