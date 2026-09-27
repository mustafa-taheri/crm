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
import { CUSTOMER_STATUSES } from "@/lib/constants/ui";
import {
  CUSTOMER_STATUS_LABELS,
  customerStatusClass,
} from "@/lib/helpers/status";
import { formatPhone, formatRelativeTime } from "@/lib/helpers/format";
import { changeCustomerStatus } from "@/lib/actions/customers";
import {
  ArrowLeft,
  Pencil,
  MessageSquare,
  Building,
  Mail,
  Phone,
  MapPin,
  Tag,
  User,
} from "lucide-react";
import type { Database } from "@/types/supabase";

type CustomerStatus = Database["public"]["Enums"]["customer_status"];

interface CustomerHeaderProps {
  customer: {
    id: string;
    name: string;
    company: string | null;
    email: string | null;
    city: string | null;
    status: CustomerStatus;
    last_contact_at: string | null;
    primary_owner?: { id: string; full_name: string } | null;
    phones?:
      | {
          id: string;
          phone_number: string;
          country_code: string;
          is_primary: boolean;
        }[]
      | null;
    tags?: { tag: { id: string; name: string } }[] | null;
  };
  conversationId?: string | null;
}

export function CustomerHeader({
  customer,
  conversationId,
}: CustomerHeaderProps) {
  const router = useRouter();
  const [updating, setUpdating] = React.useState(false);

  const primaryPhone =
    customer.phones?.find((p) => p.is_primary) || customer.phones?.[0];

  const handleStatusChange = async (newStatus: CustomerStatus) => {
    setUpdating(true);
    try {
      await changeCustomerStatus(customer.id, newStatus);
      router.refresh();
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-card border rounded-xl p-6 space-y-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Info */}
        <div className="flex items-start gap-3">
          <Link href="/customers">
            <Button variant="ghost" size="icon" className="h-9 w-9 mt-0.5">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">
                {customer.name}
              </h1>
              <Select
                value={customer.status}
                onValueChange={(v) => handleStatusChange(v as CustomerStatus)}
                disabled={updating}
              >
                <SelectTrigger className="h-7 w-auto text-xs font-semibold px-2.5">
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

            {customer.company && (
              <p className="text-sm font-medium text-muted-foreground mt-0.5 flex items-center gap-1.5">
                <Building className="h-3.5 w-3.5" />
                {customer.company}
              </p>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {conversationId ? (
            <Link href={`/whatsapp/inbox?conversationId=${conversationId}`}>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <MessageSquare className="mr-1.5 h-4 w-4" />
                Open WhatsApp Chat
              </Button>
            </Link>
          ) : (
            <Link href={`/whatsapp/inbox?customerId=${customer.id}`}>
              <Button size="sm" variant="outline">
                <MessageSquare className="mr-1.5 h-4 w-4" />
                Start Chat
              </Button>
            </Link>
          )}

          <Link href={`/customers/${customer.id}/edit`}>
            <Button variant="outline" size="sm">
              <Pencil className="mr-1.5 h-4 w-4" />
              Edit Details
            </Button>
          </Link>
        </div>
      </div>

      {/* Meta Bar */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 border-t text-xs text-muted-foreground">
        {primaryPhone && (
          <div className="flex items-center gap-1.5 font-mono text-foreground font-medium">
            <Phone className="h-3.5 w-3.5 text-primary" />
            {formatPhone(primaryPhone.phone_number, primaryPhone.country_code)}
          </div>
        )}

        {customer.email && (
          <div className="flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5" />
            {customer.email}
          </div>
        )}

        {customer.city && (
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {customer.city}
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <User className="h-3.5 w-3.5" />
          <span>
            Assigned:{" "}
            <strong className="text-foreground font-medium">
              {customer.primary_owner?.full_name || "Unassigned"}
            </strong>
          </span>
        </div>

        {customer.tags && customer.tags.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5" />
            <div className="flex gap-1">
              {customer.tags.map(({ tag }) => (
                <span
                  key={tag.id}
                  className="bg-muted px-1.5 py-0.5 rounded text-[11px] font-medium text-foreground"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
