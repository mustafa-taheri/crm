import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchCampaignDetails } from "@/lib/actions/campaigns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  BarChart3,
  Users,
  Send,
  CheckCheck,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";

interface AnalyticsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CampaignAnalyticsPage({
  params,
}: AnalyticsPageProps) {
  const { id } = await params;

  try {
    const campaign = await fetchCampaignDetails(id);
    if (!campaign) notFound();

    const recipients = campaign.recipients || [];
    const total = recipients.length;
    const sent = recipients.filter(
      (r) => r.status !== "pending" && r.status !== "cancelled",
    ).length;
    const delivered = recipients.filter((r) => r.delivered_at).length;
    const read = recipients.filter((r) => r.read_at).length;
    const replied = recipients.filter((r) => r.replied_at).length;
    const failed = recipients.filter((r) => r.status === "failed").length;

    const deliveryRate = total > 0 ? Math.round((delivered / total) * 100) : 0;
    const readRate = delivered > 0 ? Math.round((read / delivered) * 100) : 0;
    const responseRate = read > 0 ? Math.round((replied / read) * 100) : 0;

    return (
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href={`/whatsapp/campaigns/${campaign.id}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              Campaign Performance Analytics
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Performance funnel and engagement metrics for &quot;
              {campaign.name}&quot;
            </p>
          </div>
        </div>

        {/* Funnel KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-5">
            <span className="text-xs text-muted-foreground font-semibold">
              Total Audience
            </span>
            <p className="text-3xl font-bold mt-2 text-foreground">{total}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Customers targeted
            </p>
          </Card>

          <Card className="p-5">
            <span className="text-xs text-muted-foreground font-semibold">
              Delivery Rate
            </span>
            <p className="text-3xl font-bold mt-2 text-emerald-600">
              {deliveryRate}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {delivered} of {sent} delivered
            </p>
          </Card>

          <Card className="p-5">
            <span className="text-xs text-muted-foreground font-semibold">
              Read / Open Rate
            </span>
            <p className="text-3xl font-bold mt-2 text-purple-600">
              {readRate}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {read} read by customers
            </p>
          </Card>

          <Card className="p-5">
            <span className="text-xs text-muted-foreground font-semibold">
              Reply / Response Rate
            </span>
            <p className="text-3xl font-bold mt-2 text-primary">
              {responseRate}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {replied} direct inquiries
            </p>
          </Card>
        </div>

        {/* Funnel Progress Bars */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Broadcast Conversion Funnel
            </CardTitle>
            <CardDescription>
              Step-by-step customer progression through WhatsApp broadcast.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span>1. Audience Targeted</span>
                <span>{total} (100%)</span>
              </div>
              <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-slate-500 rounded-full w-full" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span>2. Messages Sent</span>
                <span>
                  {sent} ({total > 0 ? Math.round((sent / total) * 100) : 0}%)
                </span>
              </div>
              <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${total > 0 ? (sent / total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span>3. Messages Delivered</span>
                <span>
                  {delivered} ({deliveryRate}%)
                </span>
              </div>
              <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full"
                  style={{ width: `${deliveryRate}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span>4. Messages Read (Blue Ticked)</span>
                <span>
                  {read} ({total > 0 ? Math.round((read / total) * 100) : 0}%)
                </span>
              </div>
              <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full"
                  style={{ width: `${total > 0 ? (read / total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span>5. Customer Inbound Replies</span>
                <span>
                  {replied} (
                  {total > 0 ? Math.round((replied / total) * 100) : 0}%)
                </span>
              </div>
              <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{
                    width: `${total > 0 ? (replied / total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  } catch {
    notFound();
  }
}
