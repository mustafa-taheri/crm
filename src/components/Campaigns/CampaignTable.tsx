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
  CAMPAIGN_STATUS_LABELS,
  CAMPAIGN_STATUS_COLORS,
} from "@/lib/helpers/status";
import { formatDateTime, formatRelativeTime } from "@/lib/helpers/format";
import { ChevronRight, BarChart2, Megaphone } from "lucide-react";
import type { Database } from "@/types/supabase";

type CampaignStatus = Database["public"]["Enums"]["campaign_status"];

export interface CampaignRow {
  id: string;
  name: string;
  description: string | null;
  status: CampaignStatus;
  created_at: string;
  scheduled_at: string | null;
  started_at: string | null;
  template?: { id: string; name: string; content: string } | null;
  creator?: { id: string; full_name: string } | null;
  recipients?:
    | {
        id: string;
        status: string;
        read_at: string | null;
        replied_at: string | null;
        delivered_at: string | null;
      }[]
    | null;
}

export function CampaignTable({ campaigns }: { campaigns: CampaignRow[] }) {
  if (campaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center bg-card">
        <Megaphone className="h-10 w-10 text-muted-foreground mb-3 opacity-50" />
        <h3 className="text-base font-semibold">No campaigns yet</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          Create a targeted WhatsApp broadcast campaign to engage your
          customers.
        </p>
        <Link href="/whatsapp/campaigns/new">
          <Button size="sm">Create Campaign</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[280px]">Campaign</TableHead>
            <TableHead>Template</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Audience</TableHead>
            <TableHead>Engagement</TableHead>
            <TableHead>Created / Scheduled</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((c) => {
            const totalAudience = c.recipients?.length || 0;
            const sentCount =
              c.recipients?.filter((r) => r.status !== "pending").length || 0;
            const deliveredCount =
              c.recipients?.filter((r) => r.delivered_at).length || 0;
            const readCount =
              c.recipients?.filter((r) => r.read_at).length || 0;
            const repliedCount =
              c.recipients?.filter((r) => r.replied_at).length || 0;

            return (
              <TableRow key={c.id} className="group">
                <TableCell>
                  <Link
                    href={`/whatsapp/campaigns/${c.id}`}
                    className="font-semibold text-foreground hover:text-primary transition-colors block"
                  >
                    {c.name}
                  </Link>
                  {c.description && (
                    <span className="text-xs text-muted-foreground line-clamp-1">
                      {c.description}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-xs font-medium text-foreground">
                    {c.template?.name || "—"}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                      CAMPAIGN_STATUS_COLORS[c.status]
                    }`}
                  >
                    {CAMPAIGN_STATUS_LABELS[c.status]}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="text-xs">
                    <span className="font-bold text-foreground">
                      {totalAudience}
                    </span>{" "}
                    <span className="text-muted-foreground">recipients</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-xs space-y-0.5">
                    <div>
                      <span className="text-muted-foreground">Read:</span>{" "}
                      <strong className="text-foreground">{readCount}</strong>
                    </div>
                    {repliedCount > 0 && (
                      <div className="text-primary font-semibold">
                        {repliedCount} replies
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-xs text-muted-foreground">
                    {c.scheduled_at ? (
                      <div>Scheduled: {formatDateTime(c.scheduled_at)}</div>
                    ) : (
                      <div>Created: {formatRelativeTime(c.created_at)}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/whatsapp/campaigns/${c.id}/analytics`}>
                      <Button variant="ghost" size="sm" className="h-8 text-xs">
                        <BarChart2 className="h-3.5 w-3.5 mr-1 text-primary" />
                        Analytics
                      </Button>
                    </Link>
                    <Link href={`/whatsapp/campaigns/${c.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
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
  );
}
