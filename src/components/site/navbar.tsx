"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/brand/theme-toggle";
import { useEarlyAccess } from "@/components/site/early-access";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const LINKS = [
  { href: "/#problem", label: "Problem" },
  { href: "/#how", label: "How it works" },
  { href: "/#twin", label: "Digital Twin" },
  { href: "/about", label: "About" },
  { href: "/pricing", label: "Pricing" },
];

export function Navbar() {
  const { open } = useEarlyAccess();
  const [mobile, setMobile] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="PrintPulse home">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-7 text-[13px] font-medium text-muted-foreground lg:flex">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle className="hidden sm:inline-flex" />
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href="/login">Log in</Link>
          </Button>
          <Button className="hidden sm:inline-flex" onClick={() => open("access")}>
            Get early access
          </Button>
          <Button variant="outline" size="icon" className="lg:hidden" onClick={() => setMobile(true)} aria-label="Open menu">
            <Menu />
          </Button>
        </div>
      </div>
      <Sheet open={mobile} onOpenChange={setMobile}>
        <SheetContent side="left" className="w-80">
          <SheetHeader>
            <SheetTitle>
              <Logo />
            </SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1 p-3">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobile(false)}
                className="rounded-md px-3 py-2 text-sm hover:bg-accent"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/dashboard" onClick={() => setMobile(false)} className="rounded-md px-3 py-2 text-sm hover:bg-accent">
              Sample dashboard
            </Link>
            <Link href="/login" onClick={() => setMobile(false)} className="rounded-md px-3 py-2 text-sm hover:bg-accent">
              Log in
            </Link>
            <Button
              className="mt-2"
              onClick={() => {
                setMobile(false);
                open("access");
              }}
            >
              Get early access
            </Button>
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}
