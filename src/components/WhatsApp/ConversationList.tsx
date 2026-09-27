"use client";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, User } from "lucide-react";
import { formatRelativeTime } from "@/lib/helpers/format";
import {
  CUSTOMER_STATUS_LABELS,
  customerStatusClass,
} from "@/lib/helpers/status";
import type { Database } from "@/types/supabase";

type CustomerStatus = Database["public"]["Enums"]["customer_status"];

export interface ConversationItem {
  id: string;
  state: string;
  unread_count: number;
  last_message_at: string | null;
  last_customer_message_at: string | null;
  assigned_user_id: string | null;
  customer: {
    id: string;
    name: string;
    company: string | null;
    email: string | null;
    city: string | null;
    status: CustomerStatus;
    phones?: { phone_number: string; country_code: string }[] | null;
    tags?: { tag: { id: string; name: string } }[] | null;
  } | null;
  assigned_user?: { id: string; full_name: string } | null;
  messages?:
    | {
        id: string;
        content: string | null;
        direction: string;
        created_at: string;
      }[]
    | null;
}

interface ConversationListProps {
  conversations: ConversationItem[];
  activeId: string | null;
  onSelect: (id: string) => void;
  filter: "all" | "unread" | "mine";
  onFilterChange: (filter: "all" | "unread" | "mine") => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  filter,
  onFilterChange,
  searchQuery,
  onSearchChange,
}: ConversationListProps) {
  const filtered = conversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.customer?.name.toLowerCase().includes(q) ||
      c.customer?.company?.toLowerCase().includes(q) ||
      c.customer?.phones?.some((p) => p.phone_number.includes(q))
    );
  });

  return (
    <div className="flex flex-col h-full bg-card border-r w-80 shrink-0">
      {/* Search Header */}
      <div className="p-3 border-b space-y-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1">
          {(["all", "unread", "mine"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => onFilterChange(f)}
              className={`px-2.5 py-1 rounded text-xs font-semibold capitalize transition-colors ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {f === "all" ? "All" : f === "unread" ? "Unread" : "Assigned"}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            No conversations found.
          </div>
        ) : (
          filtered.map((c) => {
            const isActive = c.id === activeId;
            const lastMsg =
              c.messages && c.messages.length > 0 ? c.messages[0] : null;

            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelect(c.id)}
                className={`w-full text-left p-3 transition-colors hover:bg-muted/50 ${
                  isActive ? "bg-primary-50 dark:bg-muted" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="font-semibold text-xs truncate text-foreground block">
                    {c.customer?.name || "Unknown Customer"}
                  </span>
                  <span className="text-[10px] text-muted-foreground shrink-0 font-mono">
                    {c.last_message_at
                      ? formatRelativeTime(c.last_message_at)
                      : ""}
                  </span>
                </div>

                {c.customer?.company && (
                  <p className="text-[11px] text-muted-foreground truncate mb-1">
                    {c.customer.company}
                  </p>
                )}

                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground truncate flex-1">
                    {lastMsg?.content || "No messages"}
                  </p>
                  {c.unread_count > 0 && (
                    <Badge
                      variant="destructive"
                      className="h-4 px-1 text-[9px] font-bold shrink-0"
                    >
                      {c.unread_count}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-1.5 mt-2">
                  {c.customer?.status && (
                    <span
                      className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold ${customerStatusClass(
                        c.customer.status,
                      )}`}
                    >
                      {CUSTOMER_STATUS_LABELS[c.customer.status]}
                    </span>
                  )}
                  {c.assigned_user && (
                    <span className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
                      <User className="h-2.5 w-2.5" />
                      {c.assigned_user.full_name}
                    </span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
