"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Gauge,
  LogOut,
  Menu,
  Newspaper,
  Radio,
  Settings,
  Share2,
  Upload,
  Waypoints,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/brand/theme-toggle";
import { DashboardProvider, useDashboard } from "@/components/dashboard/dashboard-context";
import { AlertDrawer } from "@/components/dashboard/alert-drawer";
import { RecentUploads } from "@/components/dashboard/recent-uploads";
import { UploadEpaperDialog } from "@/components/dashboard/upload-epaper-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: Gauge },
  { href: "/dashboard/mentions", label: "Mentions", icon: Newspaper },
  { href: "/dashboard/trace", label: "Digital Twin", icon: Waypoints },
  { href: "/dashboard/sources", label: "Sources", icon: Radio },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <Frame>{children}</Frame>
      <AlertDrawer />
    </DashboardProvider>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const { filters, setFilters } = useDashboard();

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-border bg-card lg:flex">
        <SidebarBody />
      </aside>
      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <Button variant="outline" size="icon" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation">
            <Menu />
          </Button>
          <div className="relative min-w-0 flex-1">
            <Input
              value={filters.query}
              onChange={(event) => setFilters({ query: event.target.value })}
              placeholder="Search mentions"
              aria-label="Search mentions"
              className="max-w-md"
            />
          </div>
          <Button type="button" className="shrink-0 px-3 sm:px-4" aria-label="Upload PDF" onClick={() => setUploadOpen(true)}>
            <Upload />
            <span className="hidden sm:inline">Upload PDF</span>
          </Button>
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-3 text-sm font-medium"
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-brand-gradient text-xs font-semibold text-white">
                  AM
                </span>
                <span className="hidden sm:inline">A. Mehta</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Comms lead · PayU desk</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/">View marketing site</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">Brand keywords</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/login">
                  <LogOut className="size-4" />
                  Sign out
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="px-4 py-8 sm:px-6 lg:px-8 lg:py-10">{children}</main>
      </div>
      <UploadEpaperDialog open={uploadOpen} onOpenChange={setUploadOpen} />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Dashboard navigation</SheetTitle>
          </SheetHeader>
          <SidebarBody onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-border px-5">
        <Link href="/" onClick={onNavigate}>
          <Logo />
        </Link>
      </div>
      <nav className="min-h-0 flex-1 space-y-1 overflow-auto p-3">
        {NAV.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-accent text-[#4C1D95] dark:text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <RecentUploads variant="sidebar" onNavigate={onNavigate} />
      <div className="shrink-0 border-t border-border px-4 py-4">
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Share2 className="size-3.5 shrink-0" />
          <span>PayU desk · sample data</span>
        </p>
      </div>
    </div>
  );
}
