"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function SettingsPanel() {
  const { keywords, setKeywords, threshold, setThreshold, channels, setChannel } = useDashboard();
  const [draft, setDraft] = useState("");
  const [saved, setSaved] = useState(false);

  function addKeyword() {
    const next = draft.trim();
    if (!next || keywords.some((keyword) => keyword.toLowerCase() === next.toLowerCase())) return;
    setKeywords([...keywords, next]);
    setDraft("");
    setSaved(false);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-violet">Settings</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Brand keywords</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The desk watches PayU. Add the names and phrases that should open an alert. Changes apply to this
          session only.
        </p>
      </header>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <div>
          <Label htmlFor="brand">Watched brand</Label>
          <Input id="brand" defaultValue="PayU" className="mt-1.5 max-w-sm" />
        </div>
        <div>
          <Label htmlFor="keyword">Keywords</Label>
          <div className="mt-1.5 flex gap-2">
            <Input
              id="keyword"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addKeyword();
                }
              }}
              placeholder="Add a phrase, then press enter"
            />
            <Button type="button" variant="secondary" onClick={addKeyword}>
              Add
            </Button>
          </div>
          <ul className="mt-3 flex flex-wrap gap-2">
            {keywords.map((keyword) => (
              <li key={keyword}>
                <button
                  type="button"
                  onClick={() => setKeywords(keywords.filter((item) => item !== keyword))}
                  className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-sm text-accent-foreground"
                >
                  {keyword}
                  <X className="size-3.5" />
                  <span className="sr-only">Remove {keyword}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <div>
          <Label htmlFor="threshold">Review threshold · {threshold}%</Label>
          <input
            id="threshold"
            type="range"
            min={70}
            max={99}
            value={threshold}
            onChange={(event) => {
              setThreshold(Number(event.target.value));
              setSaved(false);
            }}
            className="mt-3 w-full accent-[#6D4AFF]"
          />
          <p className="mt-1 text-sm text-muted-foreground">
            Mentions under this confidence stay in the feed with a review flag. They do not pretend to be certain.
          </p>
        </div>
        <div className="space-y-3">
          <Channel
            label="WhatsApp"
            hint="Instant push for negative mentions and anything under the threshold."
            checked={channels.whatsapp}
            onChange={(value) => setChannel("whatsapp", value)}
          />
          <Channel
            label="Slack"
            hint="The #print-desk channel. Positive mentions can live here without paging anyone."
            checked={channels.slack}
            onChange={(value) => setChannel("slack", value)}
          />
          <Channel
            label="Email digest"
            hint="A 7:30 AM briefing in the style of a monitoring note, with the twin link on each item."
            checked={channels.email}
            onChange={(value) => setChannel("email", value)}
          />
        </div>
        <Button
          type="button"
          onClick={() => setSaved(true)}
        >
          Save desk settings
        </Button>
        {saved && <p className="text-sm text-emerald-700 dark:text-emerald-300">Saved for this session.</p>}
      </section>
    </div>
  );
}

function Channel({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border px-3 py-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{hint}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={label} />
    </div>
  );
}
