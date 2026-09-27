import type { Database } from "@/types/supabase";

type CustomerStatus = Database["public"]["Enums"]["customer_status"];
type CampaignStatus = Database["public"]["Enums"]["campaign_status"];
type FollowupPriority = Database["public"]["Enums"]["followup_priority"];

// ─── Phone formatting ───────────────────────────────────────────
export function formatPhone(phone: string, countryCode = "+91"): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10)
    return `${countryCode} ${digits.slice(0, 5)} ${digits.slice(5)}`;
  return phone;
}

export function normalizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, "");
}

// ─── Date/time formatting ────────────────────────────────────────
const IST = "Asia/Kolkata";

export function formatDate(
  dateStr: string | Date,
  opts?: Intl.DateTimeFormatOptions,
): string {
  const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  return new Intl.DateTimeFormat("en-IN", { timeZone: IST, ...opts }).format(
    date,
  );
}

export function formatDateTime(dateStr: string | Date): string {
  return formatDate(dateStr, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatRelativeTime(dateStr: string | Date): string {
  const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60_000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date, { day: "2-digit", month: "short" });
}

export function formatTime(timeStr: string | null | undefined): string {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

export function isOverdue(
  dueDate: string,
  dueTime: string | null,
  status: string,
): boolean {
  if (status !== "pending") return false;
  const dt = new Date(`${dueDate}T${dueTime ?? "23:59:59"}`);
  return dt < new Date();
}

// ─── Number formatting ───────────────────────────────────────────
export function formatCount(n: number): string {
  return new Intl.NumberFormat("en-IN").format(n);
}
