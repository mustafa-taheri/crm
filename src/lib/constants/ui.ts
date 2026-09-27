// ─── Pagination ──────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 50;
export const MAX_PAGE_SIZE = 200;

// ─── Customer statuses (ordered for pipeline display) ────────────
export const CUSTOMER_STATUSES = [
  "new_reply",
  "interested",
  "quotation",
  "negotiation",
  "won",
  "lost",
] as const;

// ─── Follow-up filters ───────────────────────────────────────────
export const FOLLOWUP_FILTERS = [
  "today",
  "upcoming",
  "overdue",
  "completed",
  "all",
] as const;

// ─── Media limits (CRM-side validation defaults) ─────────────────
export const MEDIA_LIMITS = {
  image: 10 * 1024 * 1024, // 10 MB
  video: 16 * 1024 * 1024, // 16 MB
  document: 100 * 1024 * 1024, // 100 MB
} as const;

export const ALLOWED_MEDIA_TYPES = {
  image: ["image/jpeg", "image/png", "image/webp"],
  video: ["video/mp4", "video/3gpp"],
  document: ["application/pdf"],
} as const;

// ─── Campaign batch size ─────────────────────────────────────────
export const CAMPAIGN_BATCH_SIZE = 20;

// ─── Follow-up default reminder (minutes) ────────────────────────
export const DEFAULT_REMINDER_MINUTES = 30;
