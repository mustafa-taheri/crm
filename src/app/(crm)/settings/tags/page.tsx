import { TagManagement } from "@/components/Settings/TagManagement";
import { fetchTags } from "@/lib/actions/customers";
import { Tag } from "lucide-react";

export default async function TagsSettingsPage() {
  const tags = await fetchTags();

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Tag className="h-6 w-6 text-primary" />
          Customer Tags Management
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Organize customers with custom tags for targeted broadcasts and
          segmented filtering.
        </p>
      </div>

      <TagManagement tags={tags} />
    </div>
  );
}
