import { CampaignWizard } from "@/components/Campaigns/CampaignWizard";
import { fetchTemplates } from "@/lib/actions/campaigns";
import { fetchTags } from "@/lib/actions/customers";

export default async function NewCampaignPage() {
  const [templates, tags] = await Promise.all([fetchTemplates(), fetchTags()]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <CampaignWizard templates={templates as any} tags={tags} />
    </div>
  );
}
