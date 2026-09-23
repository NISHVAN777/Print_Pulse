"use client";

import { useState } from "react";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { RecentUploads } from "@/components/dashboard/recent-uploads";
import { LANGUAGES } from "@/data/mock";
import type { Language, SourceKind } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { formatDateTime } from "@/lib/utils";

const STATUS_LABEL = {
  connected: "Connected",
  scanning: "Scanning",
  paused: "Paused",
  attention: "Needs a look",
} as const;

export function SourcesPanel() {
  const { sources, toggleSource, addSource } = useDashboard();
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-violet">Sources</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Where the morning comes from</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            ePaper PDFs on a schedule, plus one bureau inbox for photographed pages. Toggles stay in this
            browser session.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>Add source</Button>
      </header>
      <RecentUploads variant="panel" />
      <ul className="grid gap-3 lg:grid-cols-2">
        {sources.map((source) => (
          <li key={source.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">{source.publication}</h2>
                <p className="text-sm text-muted-foreground">
                  {source.city} · {source.language}
                </p>
              </div>
              <Switch
                checked={source.enabled}
                onCheckedChange={() => toggleSource(source.id)}
                aria-label={`${source.enabled ? "Pause" : "Enable"} ${source.publication}`}
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant={source.status === "attention" ? "negative" : source.status === "paused" ? "neutral" : "positive"}>
                {STATUS_LABEL[source.status]}
              </Badge>
              <Badge variant="outline">{source.kind === "epaper" ? "ePaper PDF" : "Email clipping"}</Badge>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Schedule</dt>
                <dd>{source.schedule}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Pages today</dt>
                <dd>{source.pagesToday}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-xs text-muted-foreground">Last fetch</dt>
                <dd>{formatDateTime(source.lastFetch)}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-xs text-muted-foreground">Locator</dt>
                <dd className="truncate font-mono text-xs">{source.url}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
      <AddSourceDialog
        open={open}
        onOpenChange={setOpen}
        onCreate={(draft) => {
          addSource({
            id: `src-${draft.publication.toLowerCase().replace(/\s+/g, "-")}`,
            publication: draft.publication,
            language: draft.language,
            city: draft.city,
            kind: draft.kind,
            url: draft.url,
            schedule: draft.kind === "epaper" ? "Daily · 5:45 AM" : "On arrival",
            status: "connected",
            lastFetch: "2026-09-23T06:30:00",
            pagesToday: 0,
            enabled: true,
          });
          setOpen(false);
        }}
      />
    </div>
  );
}

function AddSourceDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (draft: { publication: string; city: string; url: string; language: Language; kind: SourceKind }) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a source</DialogTitle>
          <DialogDescription>
            Saved only in this session. A production desk would validate the ePaper login before the first fetch.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            onCreate({
              publication: String(data.get("publication")),
              city: String(data.get("city")),
              url: String(data.get("url")),
              language: String(data.get("language")) as Language,
              kind: String(data.get("kind")) as SourceKind,
            });
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="publication">Publication</Label>
            <Input id="publication" name="publication" required placeholder="Lokmat" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" required placeholder="Nagpur" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="language">Language</Label>
              <select
                id="language"
                name="language"
                className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
                defaultValue="Marathi"
              >
                {LANGUAGES.map((language) => (
                  <option key={language}>{language}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="kind">Kind</Label>
            <select id="kind" name="kind" className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm" defaultValue="epaper">
              <option value="epaper">ePaper PDF</option>
              <option value="email-clipping">Email clipping</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="url">URL or inbox</Label>
            <Input id="url" name="url" required placeholder="epaper.lokmat.example" />
          </div>
          <Button type="submit" className="w-full">
            Add to desk
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
