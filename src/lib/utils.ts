import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Wall-clock formatting for demo timestamps stored as YYYY-MM-DDTHH:mm:ss. */
export function formatClock(iso: string) {
  const time = iso.split("T")[1] ?? "00:00:00";
  const [hRaw, m] = time.split(":");
  const hour = Number(hRaw);
  const suffix = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${suffix}`;
}

export function formatDate(iso: string) {
  const [date] = iso.split("T");
  const [y, mo, d] = date.split("-");
  return `${Number(d)} ${MONTHS[Number(mo) - 1]} ${y}`;
}

export function formatDateTime(iso: string) {
  return `${formatDate(iso)} · ${formatClock(iso)}`;
}

export function dayKey(iso: string) {
  return iso.slice(0, 10);
}
