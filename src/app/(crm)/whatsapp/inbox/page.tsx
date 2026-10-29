import { WhatsAppInbox } from "@/components/WhatsApp/WhatsAppInbox";
import {
  fetchConversations,
  getOrCreateConversationForCustomer,
} from "@/lib/actions/conversations";
import { fetchSalespeople } from "@/lib/actions/customers";
import { fetchTemplates } from "@/lib/actions/campaigns";

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

  const [conversations, salespeople, templates] = await Promise.all([
    fetchConversations(params.filter || "all"),
    fetchSalespeople(),
    fetchTemplates(),
  ]);

  const approvedTemplates = (templates || []).filter(
    (t) => t.status === "approved",
  );

  return (
    <WhatsAppInbox
      initialConversations={conversations as any}
      initialActiveId={initialActiveId}
      salespeople={salespeople}
      approvedTemplates={approvedTemplates}
    />
  );
}
