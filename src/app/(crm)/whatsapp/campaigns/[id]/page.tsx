import { notFound } from "next/navigation";
import { CampaignDetail } from "@/components/Campaigns/CampaignDetail";
import { fetchCampaignDetails } from "@/lib/actions/campaigns";

interface CampaignDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CampaignDetailPage({
  params,
}: CampaignDetailPageProps) {
  const { id } = await params;

  try {
    const campaign = await fetchCampaignDetails(id);
    if (!campaign) notFound();

    return (
      <div className="p-6">
        <CampaignDetail campaign={campaign as any} />
      </div>
    );
  } catch {
    notFound();
  }
}
