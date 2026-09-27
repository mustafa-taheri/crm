import type { Database } from "@/types/supabase";

type CustomerStatus = Database["public"]["Enums"]["customer_status"];
type CampaignStatus = Database["public"]["Enums"]["campaign_status"];
type FollowupPriority = Database["public"]["Enums"]["followup_priority"];

// ─── Customer Status ─────────────────────────────────────────────
export const CUSTOMER_STATUS_LABELS: Record<CustomerStatus, string> = {
  new_reply: "New Reply",
  interested: "Interested",
  quotation: "Quotation",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
};

export const CUSTOMER_STATUS_COLORS: Record<
  CustomerStatus,
  { bg: string; text: string }
> = {
  new_reply: { bg: "bg-blue-100", text: "text-blue-700" },
  interested: { bg: "bg-green-100", text: "text-green-700" },
  quotation: { bg: "bg-amber-100", text: "text-amber-700" },
  negotiation: { bg: "bg-purple-100", text: "text-purple-700" },
  won: { bg: "bg-emerald-100", text: "text-emerald-700" },
  lost: { bg: "bg-red-100", text: "text-red-700" },
};

export function customerStatusClass(status: CustomerStatus): string {
  const c = CUSTOMER_STATUS_COLORS[status];
  return `${c.bg} ${c.text}`;
}

// ─── Campaign Status ─────────────────────────────────────────────
export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: "Draft",
  pending_approval: "Pending Approval",
  approved: "Approved",
  scheduled: "Scheduled",
  running: "Running",
  paused: "Paused",
  completed: "Completed",
  cancelled: "Cancelled",
  failed: "Failed",
};

export const CAMPAIGN_STATUS_COLORS: Record<CampaignStatus, string> = {
  draft: "bg-gray-100 text-gray-600",
  pending_approval: "bg-yellow-100 text-yellow-700",
  approved: "bg-blue-100 text-blue-700",
  scheduled: "bg-purple-100 text-purple-700",
  running: "bg-green-100 text-green-700",
  paused: "bg-orange-100 text-orange-700",
  completed: "bg-teal-100 text-teal-700",
  cancelled: "bg-gray-100 text-gray-500",
  failed: "bg-red-100 text-red-700",
};

// ─── Priority ───────────────────────────────────────────────────
export const PRIORITY_LABELS: Record<FollowupPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const PRIORITY_COLORS: Record<FollowupPriority, string> = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-red-100 text-red-700",
};

// ─── Conversation State ──────────────────────────────────────────
export const CONVERSATION_STATE_LABELS = {
  open: "Open",
  closed: "Closed",
  archived: "Archived",
};
