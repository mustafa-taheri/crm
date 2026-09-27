import Link from "next/link";
import { fetchCampaignReport } from "@/lib/actions/reports";
import { ExportButton } from "@/components/Reports/ExportButton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { ArrowLeft, Megaphone, BarChart3, ExternalLink } from "lucide-react";
import { formatDateTime } from "@/lib/helpers/format";

export default async function CampaignReportsPage() {
  const campaigns = await fetchCampaignReport();

  const exportRows = campaigns.map((c) => ({
    "Campaign ID": c.id,
    "Campaign Name": c.name,
    Status: c.status,
    "Created Date": c.created_at,
    Audience: c.audience,
    Sent: c.sent,
    Delivered: c.delivered,
    Read: c.read,
    Replied: c.replied,
    Failed: c.failed,
    "Opted Out": c.opted_out,
  }));

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/reports">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Megaphone className="h-6 w-6 text-primary" />
              Campaign Performance Report
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Historical analytics and engagement conversion metrics for all
              WhatsApp broadcasts.
            </p>
          </div>
        </div>

        <ExportButton data={exportRows} filename="campaign_report" />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Audience</TableHead>
                <TableHead>Delivered</TableHead>
                <TableHead>Read Rate</TableHead>
                <TableHead>Replies</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className="text-right">Analytics</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-muted-foreground text-sm"
                  >
                    No campaign data available.
                  </TableCell>
                </TableRow>
              ) : (
                campaigns.map((c) => {
                  const readPct =
                    c.delivered > 0
                      ? Math.round((c.read / c.delivered) * 100)
                      : 0;

                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-semibold text-xs text-foreground">
                        {c.name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="text-[10px] capitalize"
                        >
                          {c.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-mono font-medium">
                        {c.audience}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-emerald-600">
                        {c.delivered}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-purple-600">
                        {c.read} ({readPct}%)
                      </TableCell>
                      <TableCell className="text-xs font-mono font-bold text-primary">
                        {c.replied}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDateTime(c.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/whatsapp/campaigns/${c.id}/analytics`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                          >
                            <BarChart3 className="h-3 w-3 mr-1 text-primary" />
                            Funnel
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
