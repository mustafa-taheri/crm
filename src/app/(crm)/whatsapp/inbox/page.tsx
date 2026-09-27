import { WhatsAppInbox } from "@/components/WhatsApp/WhatsAppInbox";
import {
  fetchConversations,
  getOrCreateConversationForCustomer,
} from "@/lib/actions/conversations";
import { fetchSalespeople } from "@/lib/actions/customers";

interface InboxPageProps {
  searchParams: Promise<{
    conversationId?: string;
    customerId?: string;
    filter?: "all" | "unread" | "mine";
  }>;
}

export default async function InboxPage({ searchParams }: InboxPageProps) {
  const params = await searchParams;

  let initialActiveId = params.conversationId || null;

  // If customerId is provided, find or create conversation
  if (params.customerId && !initialActiveId) {
    initialActiveId = await getOrCreateConversationForCustomer(
      params.customerId,
    );
  }

  const [conversations, salespeople] = await Promise.all([
    fetchConversations(params.filter || "all"),
    fetchSalespeople(),
  ]);

  return (
    <WhatsAppInbox
      initialConversations={conversations as any}
      initialActiveId={initialActiveId}
      salespeople={salespeople}
    />
  );
}
