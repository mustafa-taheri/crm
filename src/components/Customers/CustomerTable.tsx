"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CUSTOMER_STATUS_LABELS,
  customerStatusClass,
} from "@/lib/helpers/status";
import { formatPhone, formatRelativeTime } from "@/lib/helpers/format";
import { MessageSquare, Calendar, ChevronRight, User } from "lucide-react";
import type { Database } from "@/types/supabase";

type CustomerStatus = Database["public"]["Enums"]["customer_status"];

export interface CustomerRow {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  city: string | null;
  status: CustomerStatus;
  last_contact_at: string | null;
  archived_at: string | null;
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
}

interface CustomerTableProps {
  customers: CustomerRow[];
  count: number;
  page: number;
  perPage: number;
}

export function CustomerTable({
  customers,
  count,
  page,
  perPage,
}: CustomerTableProps) {
  const totalPages = Math.ceil(count / perPage);

  if (customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <User className="h-10 w-10 text-muted-foreground mb-3 opacity-50" />
        <h3 className="text-base font-semibold">No customers found</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          Try adjusting your search or filters, or add a new customer.
        </p>
        <Link href="/customers/add">
          <Button size="sm">Add Customer</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[280px]">Customer</TableHead>
              <TableHead>Phone & Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Last Contact</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((c) => {
              const primaryPhone =
                c.phones?.find((p) => p.is_primary) || c.phones?.[0];

              return (
                <TableRow key={c.id} className="group">
                  <TableCell>
                    <Link
                      href={`/customers/${c.id}`}
                      className="font-semibold text-foreground hover:text-primary transition-colors block"
                    >
                      {c.name}
                    </Link>
                    {c.company && (
                      <span className="text-xs text-muted-foreground block">
                        {c.company} {c.city ? `• ${c.city}` : ""}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-xs space-y-0.5">
                      {primaryPhone && (
                        <div className="font-mono text-foreground font-medium">
                          {formatPhone(
                            primaryPhone.phone_number,
                            primaryPhone.country_code,
                          )}
                        </div>
                      )}
                      {c.email && (
                        <div className="text-muted-foreground truncate max-w-[200px]">
                          {c.email}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${customerStatusClass(
                        c.status,
                      )}`}
                    >
                      {CUSTOMER_STATUS_LABELS[c.status]}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {c.tags && c.tags.length > 0 ? (
                        c.tags.slice(0, 3).map(({ tag }) => (
                          <span
                            key={tag.id}
                            className="inline-flex items-center rounded-sm bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground"
                          >
                            {tag.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground opacity-50">
                          —
                        </span>
                      )}
                      {c.tags && c.tags.length > 3 && (
                        <span className="text-[11px] text-muted-foreground font-medium">
                          +{c.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-medium text-foreground">
                      {c.primary_owner?.full_name || (
                        <span className="text-muted-foreground italic">
                          Unassigned
                        </span>
                      )}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {c.last_contact_at
                        ? formatRelativeTime(c.last_contact_at)
                        : "Never"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/customers/${c.id}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="View Customer 360"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-2">
        <div>
          Showing {Math.min((page - 1) * perPage + 1, count)} to{" "}
          {Math.min(page * perPage, count)} of {count} customers
        </div>
        {totalPages > 1 && (
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={`/customers?page=${page - 1}`}>
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  Previous
                </Button>
              </Link>
            )}
            {page < totalPages && (
              <Link href={`/customers?page=${page + 1}`}>
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  Next
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
