"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { sendMessage, sendTemplateMessage } from "@/lib/actions/conversations";
import { formatTime } from "@/lib/helpers/format";
import { toast } from "sonner";
import {
  Send,
  Image as ImageIcon,
  FileText,
  Video,
  AlertCircle,
  Clock,
  Sparkles,
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
  approvedTemplates?: {
    id: string;
    name: string;
    content: string;
    status: string;
  }[];
}

export function ConversationView({
  conversationId,
  customerName,
  companyName,
  lastCustomerMessageAt,
  messages,
  onMessageSent,
  approvedTemplates = [],
}: ConversationViewProps) {
  const [inputText, setInputText] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = React.useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = React.useState("");
  const [sendingTemplate, setSendingTemplate] = React.useState(false);
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

    if (isOutsideWindow) {
      toast.error(
        "The 24-hour WhatsApp messaging window has expired. Please send an approved template to re-engage.",
      );
      return;
    }

    setSending(true);
    try {
      const res = await sendMessage(conversationId, inputText.trim());
      if (res?.error) {
        toast.error(res.error);
      } else {
        setInputText("");
        onMessageSent();
      }
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleSendTemplate = async () => {
    if (!selectedTemplateId || sendingTemplate) return;

    setSendingTemplate(true);
    try {
      const res = await sendTemplateMessage(
        conversationId,
        selectedTemplateId,
        [customerName || "Customer"],
      );
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Template sent successfully");
        setIsTemplateModalOpen(false);
        setSelectedTemplateId("");
        onMessageSent();
      }
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to send template");
    } finally {
      setSendingTemplate(false);
    }
  };

  const selectedTemplate = approvedTemplates.find(
    (t) => t.id === selectedTemplateId,
  );

  const renderedPreview = selectedTemplate
    ? selectedTemplate.content.replace(/\{\{1\}\}/g, customerName || "Customer")
    : "";

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
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-amber-950 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 px-2.5 py-1 rounded-md border border-amber-300 dark:border-amber-800 font-semibold shadow-xs">
              <Clock className="h-3.5 w-3.5 text-amber-800 dark:text-amber-400" />
              <span>24h Session Closed</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs border-amber-400 bg-amber-100 hover:bg-amber-900 text-amber-150 font-semibold dark:bg-amber-950/50 dark:text-amber-200 dark:border-amber-800"
              onClick={() => setIsTemplateModalOpen(true)}
            >
              <FileText className="h-3.5 w-3.5 mr-1 text-amber-800 dark:text-amber-400" />
              Send Template
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800 font-medium">
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

      {/* Input Bar: Strict 24-Hour Policy Compliance */}
      {isOutsideWindow ? (
        <div className="p-4 border-t bg-card space-y-3">
          {/* High-contrast compliance warning box for both Light and Dark theme */}
          <div className="flex items-start gap-3 rounded-lg border-2 border-amber-400 bg-amber-100/90 p-3.5 shadow-xs dark:border-amber-800 dark:bg-amber-950/40">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-800 dark:text-amber-400 mt-0.5" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-bold text-xs text-amber-950 dark:text-amber-100">
                  WhatsApp 24-Hour Customer Care Window Closed
                </p>
                <span className="inline-flex items-center rounded-sm bg-amber-200/80 px-1.5 py-0.5 text-[10px] font-semibold text-amber-900 dark:bg-amber-900/60 dark:text-amber-200 uppercase tracking-wide">
                  Meta Policy
                </span>
              </div>
              <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
                Meta WhatsApp policy pauses free-form messaging after 24 hours
                of customer inactivity. Send an{" "}
                <strong>approved WhatsApp template</strong> to follow up and
                re-open the conversation window.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Input
              disabled
              placeholder="Session expired. Free-form chat paused until customer replies..."
              className="flex-1 h-10 bg-muted/60 border-muted-foreground/20 cursor-not-allowed text-xs text-foreground/60 font-medium"
            />
            <Button
              type="button"
              onClick={() => setIsTemplateModalOpen(true)}
              className="h-10 px-4 bg-amber-700 hover:bg-amber-800 active:bg-amber-900 text-white font-semibold text-xs shadow-sm shrink-0"
            >
              <FileText className="h-4 w-4 mr-1.5" />
              Send Approved Template
            </Button>
          </div>
        </div>
      ) : (
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
      )}

      {/* Template Selection Dialog */}
      <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
        <DialogContent className="max-w-md bg-background border bg-white dark:border-zinc-800s">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-black">
              <Sparkles className="h-4 w-4 text-primary" />
              Re-engage with WhatsApp Template
            </DialogTitle>
            <DialogDescription className="text-xs text-black/80 ">
              Select an approved Meta template to re-open the 24-hour customer
              care session with {customerName}.
            </DialogDescription>
          </DialogHeader>

          {approvedTemplates.length === 0 ? (
            <div className="p-4 rounded-lg bg-amber-100 border-2 border-amber-400 text-xs text-amber-950 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-200 font-medium shadow-xs">
              No approved templates found. Go to{" "}
              <strong className="underline">
                WhatsApp &gt; Campaigns &gt; Templates
              </strong>{" "}
              to create and approve templates first.
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Choose Template *
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">-- Select an approved template --</option>
                  {approvedTemplates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedTemplate && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Message Preview
                  </label>
                  <div className="p-3 bg-muted/50 rounded-lg text-xs whitespace-pre-wrap border font-sans text-foreground">
                    {renderedPreview}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Placeholder <code>&#123;&#123;1&#125;&#125;</code> has been
                    automatically populated with customer name:{" "}
                    <strong>{customerName}</strong>.
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 text-black/80">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsTemplateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!selectedTemplateId || sendingTemplate}
              onClick={handleSendTemplate}
            >
              {sendingTemplate ? "Sending..." : "Send Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
