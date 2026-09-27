"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
}

export function WhatsAppInbox({
  initialConversations,
  initialActiveId,
  salespeople,
}: WhatsAppInboxProps) {
  const router = useRouter();
  const [conversations, setConversations] =
    React.useState<ConversationItem[]>(initialConversations);
  const [activeId, setActiveId] = React.useState<string | null>(
    initialActiveId ||
      (initialConversations.length > 0 ? initialConversations[0].id : null),
  );
  const [activeDetails, setActiveDetails] = React.useState<any>(null);
  const [filter, setFilter] = React.useState<"all" | "unread" | "mine">("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [loadingDetails, setLoadingDetails] = React.useState(false);

  // Load active conversation details
  const loadDetails = React.useCallback(async (id: string) => {
    setLoadingDetails(true);
    try {
      const data = await fetchConversationDetails(id);
      setActiveDetails(data);
    } finally {
      setLoadingDetails(false);
    }
  }, []);

  React.useEffect(() => {
    if (activeId) {
      loadDetails(activeId);
    }
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
          // Refresh page/list data
          router.refresh();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeId, loadDetails, router]);

  const handleSelectConversation = (id: string) => {
    setActiveId(id);
  };

  const handleMessageSent = () => {
    if (activeId) {
      loadDetails(activeId);
    }
    router.refresh();
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
