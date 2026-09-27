import { TemplateList } from "@/components/Campaigns/TemplateList";
import { TemplateForm } from "@/components/Campaigns/TemplateForm";
import { fetchTemplates } from "@/lib/actions/campaigns";
import { MessageSquare, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function TemplatesPage() {
  const templates = await fetchTemplates();

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/whatsapp/campaigns">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              WhatsApp Templates
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Create and manage approved broadcast messaging templates.
            </p>
          </div>
        </div>

        <TemplateForm />
      </div>

      <TemplateList templates={templates as any} />
    </div>
  );
}
