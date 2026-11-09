import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { WhatsAppInbox } from "@/components/WhatsApp/WhatsAppInbox";

vi.mock("@/lib/actions/conversations", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/actions/conversations")>();
  return {
    ...actual,
    fetchConversationDetails: vi.fn(),
  };
});

vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(() => ({
    channel: vi.fn(() => ({
      on: vi.fn(() => ({ subscribe: vi.fn() })),
      subscribe: vi.fn(),
      removeChannel: vi.fn(),
    })),
    removeChannel: vi.fn(),
  })),
}));

import { fetchConversationDetails } from "@/lib/actions/conversations";

const mockedFetch = vi.mocked(fetchConversationDetails);

const buildConversation = (id: string, name: string) => ({
  id,
  state: "open" as const,
  unread_count: 0,
  last_message_at: null,
  last_customer_message_at: null,
  assigned_user_id: null,
  customer: {
    id: `cust-${id}`,
    name,
    company: null,
    email: null,
    city: null,
    status: "new_reply" as const,
    phones: null,
    tags: null,
  },
  assigned_user: null,
});

const conversationA = buildConversation("c1", "Alpha Customer");
const conversationB = buildConversation("c2", "Beta Customer");

const detailsA = {
  id: "c1",
  customer: { name: "Alpha Customer" },
  messages: [
    { id: "m1", content: "Hi from A", direction: "inbound", created_at: new Date().toISOString() },
  ],
};
const detailsB = {
  id: "c2",
  customer: { name: "Beta Customer" },
  messages: [
    { id: "m2", content: "Hello from Beta", direction: "inbound", created_at: new Date().toISOString() },
  ],
};

describe("WhatsAppInbox", () => {
  beforeEach(() => {
    mockedFetch.mockClear();
  });

  afterEach(() => {
    mockedFetch.mockReset();
  });

  it("clears the previous customer's data immediately when switching conversations, then loads the new one", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resolvers = new Map<string, (value: any) => void>();
    mockedFetch.mockImplementation((id: string) =>
      new Promise((resolve) => resolvers.set(id, resolve)),
    );

    render(
      <WhatsAppInbox
        initialConversations={[conversationA, conversationB]}
        initialActiveId="c1"
        salespeople={[]}
      />,
    );

    // Conversation A loads
    resolvers.get("c1")!(detailsA);
    await waitFor(() => expect(screen.getByText("Hi from A")).toBeInTheDocument());
    expect(screen.queryAllByText("Alpha Customer").length).toBeGreaterThan(0);

    // Switch to B: the active panel must clear the previous customer immediately,
    // before B's fetch resolves (the list sidebar still lists conversation A)
    fireEvent.click(screen.getByText("Beta Customer"));
    expect(screen.queryByText("Hi from A")).not.toBeInTheDocument();
    expect(screen.getByText(/select a conversation from the left/i)).toBeInTheDocument();

    // Resolve B's fetch: new customer data loads
    resolvers.get("c2")!(detailsB);
    await waitFor(() => expect(screen.getByText("Hello from Beta")).toBeInTheDocument());
    expect(mockedFetch).toHaveBeenCalledWith("c1");
    expect(mockedFetch).toHaveBeenCalledWith("c2");
  });
});
