"use client";

import Link from "next/link";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { DigitalTwinViewer } from "@/components/twin/digital-twin-viewer";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export function AlertDrawer() {
  const { drawerOpen, closeDrawer, selected } = useDashboard();

  return (
    <Sheet open={drawerOpen} onOpenChange={(open) => !open && closeDrawer()}>
      <SheetContent className="overflow-x-hidden overflow-y-auto sm:max-w-xl">
        {selected ? (
          <>
            <SheetHeader>
              <SheetTitle>{selected.headline}</SheetTitle>
              <SheetDescription>
                {selected.publication} · {selected.city} · {selected.language}. Chain of custody for{" "}
                {selected.chain.alertId}.
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-4 px-5 py-4">
              <DigitalTwinViewer mention={selected} compact />
              <Button asChild>
                <Link href={`/dashboard/trace?mention=${selected.id}`} onClick={closeDrawer}>
                  Open full Digital Twin
                </Link>
              </Button>
            </div>
          </>
        ) : (
          <SheetHeader>
            <SheetTitle>No alert selected</SheetTitle>
            <SheetDescription>Choose a mention from the feed.</SheetDescription>
          </SheetHeader>
        )}
      </SheetContent>
    </Sheet>
  );
}
