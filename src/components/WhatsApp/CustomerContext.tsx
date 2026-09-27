"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { CUSTOMER_STATUSES } from "@/lib/constants/ui";
import {
  CUSTOMER_STATUS_LABELS,
  customerStatusClass,
} from "@/lib/helpers/status";
import { formatPhone } from "@/lib/helpers/format";
import { changeCustomerStatus } from "@/lib/actions/customers";
import { assignConversation } from "@/lib/actions/conversations";
import { addCustomerNote } from "@/lib/actions/customer360";
import {
  User,
  Building,
  Mail,
  Phone,
  Tag,
  ExternalLink,
  CalendarCheck,
  StickyNote,
} from "lucide-react";
import type { Database } from "@/types/supabase";

type CustomerStatus = Database["public"]["Enums"]["customer_status"];

interface CustomerContextProps {
  conversationId: string;
  assignedUserId: string | null;
  salespeople: { id: string; full_name: string }[];
  customer: {
    id: string;
    name: string;
    company: string | null;
    email: string | null;
    city: string | null;
    status: CustomerStatus;
    phones?:
      | { phone_number: string; country_code: string; is_primary: boolean }[]
      | null;
    tags?: { tag: { id: string; name: string } }[] | null;
  };
}

export function CustomerContext({
  conversationId,
  assignedUserId,
  salespeople,
  customer,
}: CustomerContextProps) {
  const router = useRouter();
  const [quickNote, setQuickNote] = React.useState("");
  const [savingNote, setSavingNote] = React.useState(false);

  const primaryPhone =
    customer.phones?.find((p) => p.is_primary) || customer.phones?.[0];

  const handleStatusChange = async (newStatus: CustomerStatus) => {
    await changeCustomerStatus(customer.id, newStatus);
    router.refresh();
  };

  const handleAssign = async (userId: string) => {
    await assignConversation(conversationId, userId === "none" ? null : userId);
    router.refresh();
  };

  const handleAddQuickNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNote.trim()) return;
    setSavingNote(true);
    try {
      await addCustomerNote(customer.id, quickNote.trim());
      setQuickNote("");
      alert("Note added successfully");
    } finally {
      setSavingNote(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card border-l w-72 shrink-0 p-4 space-y-5 overflow-y-auto">
      {/* Customer Overview */}
      <div className="space-y-1">
        <h3 className="font-bold text-base text-foreground">{customer.name}</h3>
        {customer.company && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Building className="h-3 w-3" />
            {customer.company}
          </p>
        )}
      </div>

      {/* Action: Status & Assign */}
      <div className="space-y-3 pt-2 border-t">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">
            Status
          </label>
          <Select
            value={customer.status}
            onValueChange={(val) => handleStatusChange(val as CustomerStatus)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CUSTOMER_STATUSES.map((st) => (
                <SelectItem key={st} value={st} className="text-xs">
                  {CUSTOMER_STATUS_LABELS[st]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">
            Assign Conversation
          </label>
          <Select value={assignedUserId || "none"} onValueChange={handleAssign}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Unassigned" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none" className="text-xs">
                Unassigned
              </SelectItem>
              {salespeople.map((sp) => (
                <SelectItem key={sp.id} value={sp.id} className="text-xs">
                  {sp.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Contact Details */}
      <div className="space-y-2 text-xs border-t pt-3">
        <h4 className="font-semibold text-muted-foreground uppercase tracking-wide text-[10px]">
          Contact Details
        </h4>

        {primaryPhone && (
          <div className="flex items-center gap-2 font-mono text-foreground">
            <Phone className="h-3.5 w-3.5 text-primary" />
            <span>
              {formatPhone(
                primaryPhone.phone_number,
                primaryPhone.country_code,
              )}
            </span>
          </div>
        )}

        {customer.email && (
          <div className="flex items-center gap-2 text-muted-foreground truncate">
            <Mail className="h-3.5 w-3.5" />
            <span className="truncate">{customer.email}</span>
          </div>
        )}

        {customer.tags && customer.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {customer.tags.map(({ tag }) => (
              <span
                key={tag.id}
                className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-medium"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Quick Note Box */}
      <div className="space-y-2 border-t pt-3">
        <h4 className="font-semibold text-muted-foreground uppercase tracking-wide text-[10px] flex items-center gap-1">
          <StickyNote className="h-3 w-3" />
          Quick Note
        </h4>
        <form onSubmit={handleAddQuickNote} className="space-y-2">
          <Textarea
            placeholder="Type quick internal note..."
            value={quickNote}
            onChange={(e) => setQuickNote(e.target.value)}
            className="text-xs min-h-[60px]"
          />
          <Button
            type="submit"
            size="sm"
            disabled={savingNote || !quickNote.trim()}
            className="w-full text-xs h-7"
          >
            {savingNote ? "Saving..." : "Add Note"}
          </Button>
        </form>
      </div>

      {/* Navigation Buttons */}
      <div className="space-y-2 border-t pt-3">
        <Link href={`/follow-ups?customerId=${customer.id}`} className="block">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs justify-start h-8"
          >
            <CalendarCheck className="mr-2 h-3.5 w-3.5 text-primary" />
            Schedule Follow-up
          </Button>
        </Link>
        <Link href={`/customers/${customer.id}`} className="block">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs justify-start h-8"
          >
            <ExternalLink className="mr-2 h-3.5 w-3.5 text-primary" />
            View Customer 360
          </Button>
        </Link>
      </div>
    </div>
  );
}
