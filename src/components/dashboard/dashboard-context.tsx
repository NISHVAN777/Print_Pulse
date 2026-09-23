"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_KEYWORDS, MENTIONS, SOURCES, TODAY } from "@/data/mock";
import type { Language, Mention, Sentiment, Source, UploadRecord } from "@/types";
import { buildUploadedMention } from "@/lib/uploaded-mention";
import { dayKey } from "@/lib/utils";

export type DateFilter = "all" | "today" | "yesterday";

type Filters = {
  query: string;
  language: "all" | Language;
  sentiment: "all" | Sentiment;
  source: string;
  date: DateFilter;
};

type DashboardState = {
  filters: Filters;
  setFilters: (patch: Partial<Filters>) => void;
  resetFilters: () => void;
  mentions: Mention[];
  filtered: Mention[];
  selected: Mention | null;
  drawerOpen: boolean;
  openMention: (id: string) => void;
  closeDrawer: () => void;
  keywords: string[];
  setKeywords: (keywords: string[]) => void;
  threshold: number;
  setThreshold: (value: number) => void;
  channels: { whatsapp: boolean; slack: boolean; email: boolean };
  setChannel: (key: "whatsapp" | "slack" | "email", value: boolean) => void;
  sources: Source[];
  toggleSource: (id: string) => void;
  addSource: (source: Source) => void;
  uploads: UploadRecord[];
  addUpload: (file: File) => Mention;
};

const EMPTY: Filters = {
  query: "",
  language: "all",
  sentiment: "all",
  source: "all",
  date: "today",
};

const DashboardContext = createContext<DashboardState | null>(null);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilterState] = useState<Filters>(EMPTY);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [keywords, setKeywords] = useState<string[]>(DEFAULT_KEYWORDS);
  const [threshold, setThreshold] = useState(85);
  const [channels, setChannels] = useState({ whatsapp: true, slack: true, email: true });
  const [sources, setSources] = useState<Source[]>(SOURCES);
  const [mentions, setMentions] = useState<Mention[]>(MENTIONS);
  const [uploads, setUploads] = useState<UploadRecord[]>([]);
  const previewUrls = useRef<string[]>([]);

  useEffect(() => {
    const urls = previewUrls;
    return () => {
      urls.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return mentions.filter((mention) => {
      if (filters.language !== "all" && mention.language !== filters.language) return false;
      if (filters.sentiment !== "all" && mention.sentiment !== filters.sentiment) return false;
      if (filters.source !== "all" && mention.publication !== filters.source) return false;
      if (filters.date === "today" && dayKey(mention.detectedAt) !== TODAY) return false;
      if (filters.date === "yesterday" && dayKey(mention.detectedAt) === TODAY) return false;
      if (!q) return true;
      const haystack = [
        mention.headline,
        mention.publication,
        mention.city,
        mention.summary,
        mention.language,
        mention.translation,
        mention.fileName ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [filters, mentions]);

  const selected = mentions.find((mention) => mention.id === selectedId) ?? null;

  const value: DashboardState = {
    filters,
    setFilters: (patch) => setFilterState((current) => ({ ...current, ...patch })),
    resetFilters: () => setFilterState(EMPTY),
    mentions,
    filtered,
    selected,
    drawerOpen,
    openMention: (id) => {
      setSelectedId(id);
      setDrawerOpen(true);
    },
    closeDrawer: () => setDrawerOpen(false),
    keywords,
    setKeywords,
    threshold,
    setThreshold,
    channels,
    setChannel: (key, enabled) => setChannels((current) => ({ ...current, [key]: enabled })),
    sources,
    toggleSource: (id) =>
      setSources((current) =>
        current.map((source) =>
          source.id === id
            ? {
                ...source,
                enabled: !source.enabled,
                status: !source.enabled ? "connected" : "paused",
              }
            : source,
        ),
      ),
    addSource: (source) => setSources((current) => [source, ...current]),
    uploads,
    addUpload: (file) => {
      const previewUrl = URL.createObjectURL(file);
      previewUrls.current.push(previewUrl);
      const mention = buildUploadedMention(file, previewUrl);
      const upload: UploadRecord = {
        id: mention.id,
        fileName: file.name,
        sizeBytes: file.size,
        uploadedAt: mention.detectedAt,
        mentionId: mention.id,
      };
      setMentions((current) => [mention, ...current]);
      setUploads((current) => [upload, ...current]);
      return mention;
    },
  };

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used inside DashboardProvider");
  return ctx;
}
