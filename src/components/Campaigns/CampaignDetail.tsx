"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CAMPAIGN_STATUS_LABELS,
  CAMPAIGN_STATUS_COLORS,
} from "@/lib/helpers/status";
import { formatDateTime, formatRelativeTime } from "@/lib/helpers/format";
import {
  approveCampaign,
  startOrScheduleCampaign,
  pauseOrCancelCampaign,
} from "@/lib/actions/campaigns";
import { useUser } from "@/lib/hooks/useUser";
import {
  ArrowLeft,
  CheckCircle2,
  Play,
  Pause,
  XCircle,
  BarChart2,
  Users,
  Send,
  Eye,
  FileText,
} from "lucide-react";

interface CampaignDetailProps {
  campaign: {
    id: string;
    name: string;
    description: string | null;
    status: string;
    created_at: string;
    scheduled_at: string | null;
    started_at: string | null;
    template?: { id: string; name: string; content: string } | null;
    creator?: { id: string; full_name: string } | null;
    approver?: { id: string; full_name: string } | null;
    media?:
      | {
          id: string;
          media_type: string;
          file_url: string | null;
          file_name: string | null;
        }[]
      | null;
    recipients?:
      | {
          id: string;
          status: string;
          sent_at: string | null;
          delivered_at: string | null;
          read_at: string | null;
          replied_at: string | null;
          failed_at: string | null;
          customer?: {
            id: string;
            name: string;
            company: string | null;
            email: string | null;
          } | null;
        }[]
      | null;
  };
}

export function CampaignDetail({ campaign }: CampaignDetailProps) {
  const router = useRouter();
  const { role } = useUser();
  const isAdmin = role === "admin";
  const [acting, setActing] = React.useState(false);

  const recipients = campaign.recipients || [];
  const totalAudience = recipients.length;
  const sentCount = recipients.filter(
    (r) => r.status !== "pending" && r.status !== "cancelled",
  ).length;
  const deliveredCount = recipients.filter((r) => r.delivered_at).length;
  const readCount = recipients.filter((r) => r.read_at).length;
  const repliedCount = recipients.filter((r) => r.replied_at).length;
  const failedCount = recipients.filter((r) => r.status === "failed").length;

  const handleApprove = async () => {
    setActing(true);
    try {
      await approveCampaign(campaign.id);
      router.refresh();
    } finally {
      setActing(false);
    }
  };

  const handleStart = async () => {
    setActing(true);
    try {
      await startOrScheduleCampaign(campaign.id, true);
      router.refresh();
    } finally {
      setActing(false);
    }
  };

  const handlePause = async () => {
    setActing(true);
    try {
      await pauseOrCancelCampaign(campaign.id, "paused");
      router.refresh();
    } finally {
      setActing(false);
    }
  };

  const handleCancel = async () => {
    if (
      !confirm(
        "Are you sure you want to cancel this campaign? Pending messages will not be sent.",
      )
    )
      return;
    setActing(true);
    try {
      await pauseOrCancelCampaign(campaign.id, "cancelled");
      router.refresh();
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border rounded-xl p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <Link href="/whatsapp/campaigns">
            <Button variant="ghost" size="icon" className="h-9 w-9 mt-0.5">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">
                {campaign.name}
              </h1>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  CAMPAIGN_STATUS_COLORS[
                    campaign.status as keyof typeof CAMPAIGN_STATUS_COLORS
                  ] || "bg-muted"
                }`}
              >
                {CAMPAIGN_STATUS_LABELS[
                  campaign.status as keyof typeof CAMPAIGN_STATUS_LABELS
                ] || campaign.status}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Created by {campaign.creator?.full_name || "Team member"} •{" "}
              {formatDateTime(campaign.created_at)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Link href={`/whatsapp/campaigns/${campaign.id}/analytics`}>
            <Button variant="outline" size="sm">
              <BarChart2 className="mr-1.5 h-4 w-4 text-primary" />
              Full Analytics
            </Button>
          </Link>

          {isAdmin && campaign.status === "pending_approval" && (
            <Button
              size="sm"
              onClick={handleApprove}
              disabled={acting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
              Approve Campaign
            </Button>
          )}

          {isAdmin &&
            (campaign.status === "approved" ||
              campaign.status === "paused") && (
              <Button size="sm" onClick={handleStart} disabled={acting}>
                <Play className="mr-1.5 h-4 w-4" />
                Start Broadcast
              </Button>
            )}

          {campaign.status === "running" && (
            <Button
              size="sm"
              variant="outline"
              onClick={handlePause}
              disabled={acting}
            >
              <Pause className="mr-1.5 h-4 w-4 text-amber-600" />
              Pause
            </Button>
          )}

          {["running", "scheduled", "approved", "paused"].includes(
            campaign.status,
          ) && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              disabled={acting}
              className="text-error hover:bg-error/10"
            >
              <XCircle className="mr-1.5 h-4 w-4" />
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Total Audience</p>
          <p className="text-xl font-bold mt-1 text-foreground">
            {totalAudience}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Messages Sent</p>
          <p className="text-xl font-bold mt-1 text-blue-600">{sentCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Delivered</p>
          <p className="text-xl font-bold mt-1 text-emerald-600">
            {deliveredCount}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Read by Customer</p>
          <p className="text-xl font-bold mt-1 text-purple-600">{readCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Replies Received</p>
          <p className="text-xl font-bold mt-1 text-primary">{repliedCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Failed</p>
          <p className="text-xl font-bold mt-1 text-error">{failedCount}</p>
        </Card>
      </div>

      {/* Template & Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">
              Campaign Template & Content
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-muted text-xs font-mono whitespace-pre-wrap">
              {campaign.template?.content || "No template content"}
            </div>

            {campaign.media && campaign.media.length > 0 && (
              <div className="space-y-2 border-t pt-3">
                <h4 className="text-xs font-semibold text-muted-foreground">
                  Attached Broadcast Media
                </h4>
                {campaign.media.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-2 text-xs p-2 rounded bg-muted/40 border"
                  >
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="font-semibold uppercase text-[10px]">
                      {m.media_type}:
                    </span>
                    <span className="truncate">
                      {m.file_name || m.file_url}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Broadcast Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b">
              <span className="text-muted-foreground">Status:</span>
              <span className="font-bold capitalize">{campaign.status}</span>
            </div>
            <div className="flex justify-between py-1 border-b">
              <span className="text-muted-foreground">Template:</span>
              <span className="font-medium">{campaign.template?.name}</span>
            </div>
            <div className="flex justify-between py-1 border-b">
              <span className="text-muted-foreground">Approved by:</span>
              <span>{campaign.approver?.full_name || "Pending Approval"}</span>
            </div>
            {campaign.scheduled_at && (
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Scheduled For:</span>
                <span>{formatDateTime(campaign.scheduled_at)}</span>
              </div>
            )}
            {campaign.started_at && (
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Started At:</span>
                <span>{formatDateTime(campaign.started_at)}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recipient Status Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Recipients List ({totalAudience})
          </CardTitle>
          <CardDescription>
            Individual delivery and reply statuses for each customer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent At</TableHead>
                  <TableHead>Delivered</TableHead>
                  <TableHead>Read</TableHead>
                  <TableHead>Reply Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recipients.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <Link
                        href={`/customers/${r.customer?.id}`}
                        className="font-semibold text-xs text-foreground hover:text-primary transition-colors block"
                      >
                        {r.customer?.name}
                      </Link>
                      {r.customer?.company && (
                        <span className="text-[11px] text-muted-foreground">
                          {r.customer.company}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="text-[10px] capitalize"
                      >
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {r.sent_at ? formatDateTime(r.sent_at) : "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {r.delivered_at ? formatDateTime(r.delivered_at) : "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {r.read_at ? formatDateTime(r.read_at) : "—"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {r.replied_at ? (
                        <span className="text-success font-semibold">
                          Replied {formatRelativeTime(r.replied_at)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
