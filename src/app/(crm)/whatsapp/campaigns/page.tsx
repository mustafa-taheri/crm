import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CampaignTable } from "@/components/Campaigns/CampaignTable";
import { fetchCampaigns } from "@/lib/actions/campaigns";
import { Megaphone, Plus, FileText } from "lucide-react";

export default async function CampaignsPage() {
  const campaigns = await fetchCampaigns();

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-primary" />
            WhatsApp Broadcast Campaigns
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Create, schedule, and track bulk WhatsApp broadcast marketing
            campaigns.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/whatsapp/campaigns/templates">
            <Button variant="outline" size="sm" className="h-9">
              <FileText className="mr-1.5 h-4 w-4" />
              Templates
            </Button>
          </Link>
          <Link href="/whatsapp/campaigns/new">
            <Button size="sm" className="h-9">
              <Plus className="mr-1.5 h-4 w-4" />
              New Campaign
            </Button>
          </Link>
        </div>
      </div>

      <CampaignTable campaigns={campaigns as any} />
    </div>
  );
}
