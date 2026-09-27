"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Activity as ActivityIcon,
  StickyNote,
  CalendarCheck,
  Megaphone,
  Plus,
  Send,
  CheckCircle2,
  Clock,
  User,
} from "lucide-react";
import {
  formatDateTime,
  formatRelativeTime,
  formatPhone,
} from "@/lib/helpers/format";
import { addCustomerNote } from "@/lib/actions/customer360";
import { completeFollowup } from "@/lib/actions/followups";
import type { Database } from "@/types/supabase";

interface Customer360TabsProps {
  customerId: string;
  customer: {
    id: string;
    name: string;
    company: string | null;
    email: string | null;
    city: string | null;
    industry: string | null;
    source: string | null;
    status: string;
    marketing_opt_out: boolean;
    created_at: string;
    phones?:
      | { phone_number: string; country_code: string; is_primary: boolean }[]
      | null;
  };
  conversation?: {
    id: string;
    state: string;
    last_message_at: string | null;
    messages?: {
      id: string;
      direction: string;
      message_type: string;
      content: string | null;
      created_at: string;
      status: string;
      sender?: { full_name: string } | null;
    }[];
  } | null;
  activities: {
    id: string;
    activity_type: string;
    description: string;
    created_at: string;
    user?: { full_name: string } | null;
  }[];
  notes: {
    id: string;
    content: string;
    created_at: string;
    creator?: { full_name: string } | null;
  }[];
  followups: {
    id: string;
    description: string;
    due_date: string;
    due_time: string | null;
    priority: string;
    status: string;
    completed_at: string | null;
    assigned_user?: { full_name: string } | null;
  }[];
  campaignRecipients: {
    id: string;
    status: string;
    sent_at: string | null;
    delivered_at: string | null;
    read_at: string | null;
    replied_at: string | null;
    failed_at: string | null;
    campaign?: { id: string; name: string; created_at: string } | null;
  }[];
}

export function Customer360Tabs({
  customerId,
  customer,
  conversation,
  activities,
  notes,
  followups,
  campaignRecipients,
}: Customer360TabsProps) {
  const router = useRouter();
  const [noteText, setNoteText] = React.useState("");
  const [addingNote, setAddingNote] = React.useState(false);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setAddingNote(true);
    try {
      await addCustomerNote(customerId, noteText.trim());
      setNoteText("");
      router.refresh();
    } finally {
      setAddingNote(false);
    }
  };

  const handleCompleteFollowup = async (fId: string) => {
    await completeFollowup(fId);
    router.refresh();
  };

  return (
    <Tabs defaultValue="overview" className="w-full space-y-4">
      <TabsList className="bg-muted p-1 rounded-lg">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="whatsapp" className="flex items-center gap-1.5">
          <MessageSquare className="h-3.5 w-3.5" />
          WhatsApp ({conversation?.messages?.length || 0})
        </TabsTrigger>
        <TabsTrigger value="followups" className="flex items-center gap-1.5">
          <CalendarCheck className="h-3.5 w-3.5" />
          Follow-ups ({followups.filter((f) => f.status === "pending").length})
        </TabsTrigger>
        <TabsTrigger value="notes" className="flex items-center gap-1.5">
          <StickyNote className="h-3.5 w-3.5" />
          Notes ({notes.length})
        </TabsTrigger>
        <TabsTrigger value="campaigns" className="flex items-center gap-1.5">
          <Megaphone className="h-3.5 w-3.5" />
          Campaigns ({campaignRecipients.length})
        </TabsTrigger>
        <TabsTrigger value="activity" className="flex items-center gap-1.5">
          <ActivityIcon className="h-3.5 w-3.5" />
          Activity Log
        </TabsTrigger>
      </TabsList>

      {/* 1. OVERVIEW TAB */}
      <TabsContent value="overview" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Company:</span>
                <span className="font-medium text-foreground">
                  {customer.company || "—"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium text-foreground">
                  {customer.email || "—"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">City:</span>
                <span className="font-medium text-foreground">
                  {customer.city || "—"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Industry:</span>
                <span className="font-medium text-foreground">
                  {customer.industry || "—"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Source:</span>
                <span className="font-medium text-foreground">
                  {customer.source || "—"}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">
                  Marketing Opt-Out:
                </span>
                <span className="font-medium text-foreground">
                  {customer.marketing_opt_out
                    ? "Yes (Opted out)"
                    : "No (Receives campaigns)"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Phone Numbers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {customer.phones?.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/20 text-sm"
                >
                  <span className="font-mono font-medium">
                    {formatPhone(p.phone_number, p.country_code)}
                  </span>
                  {p.is_primary && (
                    <Badge variant="outline" className="text-xs">
                      Primary
                    </Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* 2. WHATSAPP TAB */}
      <TabsContent value="whatsapp" className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">WhatsApp Messages</CardTitle>
            {conversation && (
              <Link href={`/whatsapp/inbox?conversationId=${conversation.id}`}>
                <Button size="sm" variant="outline">
                  Open in Live Inbox
                </Button>
              </Link>
            )}
          </CardHeader>
          <CardContent>
            {!conversation ||
            !conversation.messages ||
            conversation.messages.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No WhatsApp message history found with this customer.
              </div>
            ) : (
              <div className="space-y-3 max-h-[450px] overflow-y-auto p-2">
                {conversation.messages.map((m) => {
                  const isInbound = m.direction === "inbound";
                  return (
                    <div
                      key={m.id}
                      className={`flex ${isInbound ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-xl p-3 text-sm ${
                          isInbound
                            ? "bg-muted text-foreground rounded-bl-none"
                            : "bg-primary text-primary-foreground rounded-br-none"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{m.content}</p>
                        <div
                          className={`flex items-center gap-1.5 text-[10px] mt-1.5 opacity-80 ${
                            isInbound
                              ? "text-muted-foreground"
                              : "text-primary-foreground"
                          }`}
                        >
                          {!isInbound && m.sender && (
                            <span className="font-semibold">
                              {m.sender.full_name} •{" "}
                            </span>
                          )}
                          <span>{formatDateTime(m.created_at)}</span>
                          {!isInbound && (
                            <span className="uppercase">• {m.status}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* 3. FOLLOW-UPS TAB */}
      <TabsContent value="followups" className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Customer Follow-ups</CardTitle>
            <Link href={`/follow-ups?customerId=${customerId}`}>
              <Button size="sm">
                <Plus className="mr-1 h-3.5 w-3.5" />
                Schedule Follow-up
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {followups.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No follow-ups scheduled for this customer.
              </div>
            ) : (
              <div className="divide-y">
                {followups.map((f) => (
                  <div
                    key={f.id}
                    className="py-3 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            f.status === "completed"
                              ? "bg-success/10 text-success"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {f.status}
                        </span>
                        <span className="text-xs font-mono text-muted-foreground">
                          Due: {f.due_date}{" "}
                          {f.due_time ? `@ ${f.due_time}` : ""}
                        </span>
                      </div>
                      <p className="text-sm font-medium">{f.description}</p>
                      {f.assigned_user && (
                        <p className="text-xs text-muted-foreground">
                          Assigned to: {f.assigned_user.full_name}
                        </p>
                      )}
                    </div>

                    {f.status === "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCompleteFollowup(f.id)}
                        className="text-xs h-8 text-success hover:text-success"
                      >
                        <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                        Mark Done
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* 4. NOTES TAB */}
      <TabsContent value="notes" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add Internal Note</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddNote} className="space-y-3">
              <Textarea
                placeholder="Write internal notes about client preferences, pricing discussion, meetings..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="min-h-[80px]"
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  disabled={addingNote || !noteText.trim()}
                >
                  <Send className="mr-1.5 h-3.5 w-3.5" />
                  {addingNote ? "Saving..." : "Save Note"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {notes.map((n) => (
            <Card key={n.id}>
              <CardContent className="p-4 space-y-2">
                <p className="text-sm whitespace-pre-wrap text-foreground">
                  {n.content}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground border-t pt-2">
                  <User className="h-3 w-3" />
                  <span>{n.creator?.full_name || "Salesperson"}</span>
                  <span>•</span>
                  <span>{formatDateTime(n.created_at)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      {/* 5. CAMPAIGNS TAB */}
      <TabsContent value="campaigns" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Broadcast Campaign History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {campaignRecipients.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No marketing campaigns sent to this customer yet.
              </div>
            ) : (
              <div className="divide-y">
                {campaignRecipients.map((cr) => (
                  <div
                    key={cr.id}
                    className="py-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold">
                        {cr.campaign?.name || "Campaign"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Sent:{" "}
                        {cr.sent_at ? formatDateTime(cr.sent_at) : "Pending"}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <span className="text-xs uppercase font-bold px-2 py-0.5 rounded bg-muted text-foreground">
                        {cr.status}
                      </span>
                      {cr.read_at && (
                        <p className="text-[10px] text-success font-medium">
                          Read {formatRelativeTime(cr.read_at)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* 6. ACTIVITY LOG TAB */}
      <TabsContent value="activity" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              System Activity Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No activity recorded yet.
              </div>
            ) : (
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                {activities.map((a) => (
                  <div key={a.id} className="relative group">
                    <div className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" />
                    <div className="text-sm">
                      <span className="font-medium text-foreground">
                        {a.description}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      {a.user && <span>by {a.user.full_name}</span>}
                      <span>•</span>
                      <span>{formatDateTime(a.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
