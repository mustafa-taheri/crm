"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendMessage } from "@/lib/actions/conversations";
import { formatTime, formatDateTime } from "@/lib/helpers/format";
import {
  Send,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Video,
  AlertCircle,
  Clock,
  User,
} from "lucide-react";

interface MessageItem {
  id: string;
  direction: "inbound" | "outbound";
  message_type: string;
  content: string | null;
  status: string;
  created_at: string;
  sender?: { full_name: string } | null;
  media?:
    | {
        id: string;
        media_type: string;
        file_url: string | null;
        file_name: string | null;
      }[]
    | null;
}

interface ConversationViewProps {
  conversationId: string;
  customerName: string;
  companyName?: string | null;
  lastCustomerMessageAt?: string | null;
  messages: MessageItem[];
  onMessageSent: () => void;
}

export function ConversationView({
  conversationId,
  customerName,
  companyName,
  lastCustomerMessageAt,
  messages,
  onMessageSent,
}: ConversationViewProps) {
  const [inputText, setInputText] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const isOutsideWindow =
    !lastCustomerMessageAt ||
    Date.now() - new Date(lastCustomerMessageAt).getTime() >
      24 * 60 * 60 * 1000;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    setSending(true);
    try {
      await sendMessage(conversationId, inputText.trim());
      setInputText("");
      onMessageSent();
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full flex-1 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b bg-card">
        <div>
          <h2 className="font-bold text-sm text-foreground">{customerName}</h2>
          {companyName && (
            <p className="text-xs text-muted-foreground">{companyName}</p>
          )}
        </div>

        {isOutsideWindow ? (
          <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-800">
            <Clock className="h-3.5 w-3.5" />
            <span>
              Outside 24h WhatsApp session (Template required for broadcast)
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>24h Service Session Active</span>
          </div>
        )}
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground text-xs">
            <p>No messages in this conversation yet.</p>
            <p className="mt-1">
              Send a message below to start communicating on WhatsApp.
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const isInbound = m.direction === "inbound";

            return (
              <div
                key={m.id}
                className={`flex ${isInbound ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-sm space-y-1.5 ${
                    isInbound
                      ? "bg-muted text-foreground rounded-bl-sm border"
                      : "bg-primary text-primary-foreground rounded-br-sm"
                  }`}
                >
                  {m.content && (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  )}

                  {m.media && m.media.length > 0 && (
                    <div className="space-y-1 pt-1">
                      {m.media.map((med) => (
                        <div
                          key={med.id}
                          className="flex items-center gap-2 p-2 rounded bg-black/10 text-xs"
                        >
                          {med.media_type === "image" && (
                            <ImageIcon className="h-4 w-4" />
                          )}
                          {med.media_type === "document" && (
                            <FileText className="h-4 w-4" />
                          )}
                          {med.media_type === "video" && (
                            <Video className="h-4 w-4" />
                          )}
                          <span className="truncate">
                            {med.file_name || "Attachment"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div
                    className={`flex items-center justify-end gap-1.5 text-[10px] ${
                      isInbound
                        ? "text-muted-foreground"
                        : "text-primary-foreground/80"
                    }`}
                  >
                    {!isInbound && m.sender && (
                      <span>{m.sender.full_name} • </span>
                    )}
                    <span>
                      {formatTime(
                        new Date(m.created_at).toTimeString().slice(0, 5),
                      )}
                    </span>
                    {!isInbound && (
                      <span className="uppercase">• {m.status}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={handleSend}
        className="p-4 border-t bg-card flex items-center gap-2"
      >
        <Input
          placeholder="Type a message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 h-10"
        />
        <Button
          type="submit"
          disabled={sending || !inputText.trim()}
          size="default"
          className="h-10 px-4"
        >
          <Send className="h-4 w-4 mr-1.5" />
          {sending ? "Sending..." : "Send"}
        </Button>
      </form>
    </div>
  );
}
