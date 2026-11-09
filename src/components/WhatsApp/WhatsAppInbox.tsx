"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import {
  ConversationList,
  type ConversationItem,
} from "@/components/WhatsApp/ConversationList";
import { ConversationView } from "@/components/WhatsApp/ConversationView";
import { CustomerContext } from "@/components/WhatsApp/CustomerContext";
import { fetchConversationDetails } from "@/lib/actions/conversations";

interface WhatsAppInboxProps {
  initialConversations: ConversationItem[];
  initialActiveId?: string | null;
  salespeople: { id: string; full_name: string }[];
  approvedTemplates?: {
    id: string;
    name: string;
    content: string;
    status: string;
  }[];
}

export function WhatsAppInbox({
  initialConversations,
  initialActiveId,
  salespeople,
  approvedTemplates = [],
}: WhatsAppInboxProps) {
  const [conversations] = React.useState<ConversationItem[]>(initialConversations);
  const [activeId, setActiveId] = React.useState<string | null>(
    initialActiveId ||
      (initialConversations.length > 0 ? initialConversations[0].id : null),
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [activeDetails, setActiveDetails] = React.useState<any>(null);
  const [filter, setFilter] = React.useState<"all" | "unread" | "mine">("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const pendingVersion = React.useRef(0);

  // Load active conversation details. Async-only: callers clear stale data
  // synchronously when switching conversations.
  const loadDetails = React.useCallback(async (id: string) => {
    const version = ++pendingVersion.current;
    try {
      const data = await fetchConversationDetails(id);
      if (version !== pendingVersion.current) return; // ignore stale responses from rapid switches
      setActiveDetails(data);
    } finally {
      // no-op; loading state tracked by setActiveDetails alone
    }
  }, []);

  React.useEffect(() => {
    if (!activeId) return;
    loadDetails(activeId);
  }, [activeId, loadDetails]);

  // Realtime Supabase Subscription for incoming messages
  React.useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("inbox-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          // If message is for currently active conversation, reload details
          if (activeId && payload.new.conversation_id === activeId) {
            loadDetails(activeId);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeId, loadDetails]);

  const handleSelectConversation = (id: string) => {
    // Clear the previous customer's data immediately when switching, so stale
    // data never flashes while the newly selected conversation loads.
    setActiveDetails(null);
    setActiveId(id);
  };

  const handleMessageSent = () => {
    if (activeId) {
      loadDetails(activeId);
    }
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Panel 1: Conversation List */}
      <ConversationList
        conversations={conversations}
        activeId={activeId}
        onSelect={handleSelectConversation}
        filter={filter}
        onFilterChange={setFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Panel 2: Conversation View */}
      {activeDetails ? (
        <ConversationView
          conversationId={activeDetails.id}
          customerName={activeDetails.customer?.name || "Customer"}
          companyName={activeDetails.customer?.company}
          lastCustomerMessageAt={activeDetails.last_customer_message_at}
          messages={activeDetails.messages || []}
          onMessageSent={handleMessageSent}
          approvedTemplates={approvedTemplates}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground bg-muted/20">
          Select a conversation from the left to view messages
        </div>
      )}

      {/* Panel 3: Customer Context */}
      {activeDetails && activeDetails.customer && (
        <CustomerContext
          conversationId={activeDetails.id}
          assignedUserId={activeDetails.assigned_user_id}
          salespeople={salespeople}
          customer={activeDetails.customer}
        />
      )}
    </div>
  );
}
