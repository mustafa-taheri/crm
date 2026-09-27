"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CUSTOMER_STATUSES } from "@/lib/constants/ui";
import { CUSTOMER_STATUS_LABELS } from "@/lib/helpers/status";
import { createCampaign } from "@/lib/actions/campaigns";
import { useUser } from "@/lib/hooks/useUser";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Users,
  FileText,
  Paperclip,
  Calendar,
  Send,
  Eye,
} from "lucide-react";
import Link from "next/link";

interface CampaignWizardProps {
  templates: { id: string; name: string; content: string; status: string }[];
  tags: { id: string; name: string }[];
}

export function CampaignWizard({ templates, tags }: CampaignWizardProps) {
  const router = useRouter();
  const { role } = useUser();
  const isAdmin = role === "admin";

  const approvedTemplates = templates.filter((t) => t.status === "approved");

  const [step, setStep] = React.useState<number>(1);
  const [submitting, setSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Form states
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [templateId, setTemplateId] = React.useState(
    approvedTemplates.length > 0 ? approvedTemplates[0].id : "",
  );
  const [audienceType, setAudienceType] = React.useState<"all" | "filtered">(
    "all",
  );
  const [selectedTagIds, setSelectedTagIds] = React.useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = React.useState<string[]>([]);
  const [cityFilter, setCityFilter] = React.useState("");

  // Media
  const [hasMedia, setHasMedia] = React.useState(false);
  const [mediaType, setMediaType] = React.useState<"image" | "pdf" | "video">(
    "image",
  );
  const [mediaUrl, setMediaUrl] = React.useState("");
  const [mediaFileName, setMediaFileName] = React.useState("");

  // Schedule
  const [sendOption, setSendOption] = React.useState<"now" | "later">("now");
  const [scheduledAt, setScheduledAt] = React.useState("");

  const selectedTemplate = templates.find((t) => t.id === templateId);

  const toggleTag = (id: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  };

  const toggleStatus = (st: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(st) ? prev.filter((s) => s !== st) : [...prev, st],
    );
  };

  const handleSubmit = async () => {
    if (!name.trim() || !templateId) {
      setErrorMsg(
        "Please fill in the campaign name and select an approved template.",
      );
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await createCampaign({
        name: name.trim(),
        description: description.trim() || undefined,
        template_id: templateId,
        audience_type: audienceType,
        audience_filters:
          audienceType === "filtered"
            ? {
                tag_ids: selectedTagIds.length > 0 ? selectedTagIds : undefined,
                status:
                  selectedStatuses.length > 0 ? selectedStatuses : undefined,
                city: cityFilter.trim() || undefined,
              }
            : undefined,
        media:
          hasMedia && mediaUrl.trim()
            ? [
                {
                  media_type: mediaType,
                  file_url: mediaUrl.trim(),
                  file_name: mediaFileName.trim() || "attachment",
                },
              ]
            : undefined,
        schedule_now: sendOption === "now",
        scheduled_at:
          sendOption === "later" && scheduledAt ? scheduledAt : undefined,
      });

      if (res.error) {
        setErrorMsg(res.error);
      } else if (res.data?.id) {
        router.push(`/whatsapp/campaigns/${res.data.id}`);
      }
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || "Failed to create campaign");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header & Steps */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-2">
          <Link href="/whatsapp/campaigns">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">
            Create WhatsApp Campaign
          </h1>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold">
          {[1, 2, 3, 4, 5].map((s) => (
            <span
              key={s}
              className={`px-2 py-0.5 rounded ${
                step === s
                  ? "bg-primary text-primary-foreground font-bold"
                  : step > s
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground"
              }`}
            >
              Step {s}
            </span>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-md bg-error/10 border border-error/20 text-error text-sm font-medium">
          {errorMsg}
        </div>
      )}

      {/* STEP 1: Details */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
            <CardDescription>
              Give your marketing broadcast a clear, descriptive name.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="camp-name">Campaign Name *</Label>
              <Input
                id="camp-name"
                placeholder="e.g. Diwali Corporate Gifting Broadcast"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="camp-desc">Description / Internal Goal</Label>
              <Textarea
                id="camp-desc"
                placeholder="Targeting VIP retail clients with latest festive catalogue..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={() => setStep(2)} disabled={!name.trim()}>
                Next: Choose Audience →
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 2: Audience Selection */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Audience</CardTitle>
            <CardDescription>
              Choose which customers will receive this WhatsApp broadcast.
              Customers who opted out will be automatically excluded.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setAudienceType("all")}
                className={`p-4 rounded-xl border text-left transition-all ${
                  audienceType === "all"
                    ? "border-primary bg-primary-50 dark:bg-muted font-semibold"
                    : "border-border hover:bg-muted/40"
                }`}
              >
                <Users className="h-5 w-5 text-primary mb-2" />
                <h4 className="text-sm font-bold">All Customers</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Broadcast to all active, non-archived customers with valid
                  phone numbers.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setAudienceType("filtered")}
                className={`p-4 rounded-xl border text-left transition-all ${
                  audienceType === "filtered"
                    ? "border-primary bg-primary-50 dark:bg-muted font-semibold"
                    : "border-border hover:bg-muted/40"
                }`}
              >
                <Users className="h-5 w-5 text-primary mb-2" />
                <h4 className="text-sm font-bold">Segmented Audience</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Filter by customer tags, pipeline status, or specific city.
                </p>
              </button>
            </div>

            {audienceType === "filtered" && (
              <div className="space-y-4 pt-4 border-t">
                {/* Tag filters */}
                <div className="space-y-2">
                  <Label>Filter by Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                          selectedTagIds.includes(tag.id)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-muted-foreground border-border hover:border-primary/50"
                        }`}
                      >
                        {tag.name}
                      </button>
                    ))}
                    {tags.length === 0 && (
                      <span className="text-xs text-muted-foreground">
                        No tags available.
                      </span>
                    )}
                  </div>
                </div>

                {/* Pipeline stage filter */}
                <div className="space-y-2">
                  <Label>Filter by Lead Stage</Label>
                  <div className="flex flex-wrap gap-2">
                    {CUSTOMER_STATUSES.map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => toggleStatus(st)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                          selectedStatuses.includes(st)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-muted-foreground border-border hover:border-primary/50"
                        }`}
                      >
                        {CUSTOMER_STATUS_LABELS[st]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* City filter */}
                <div className="space-y-1.5 max-w-sm">
                  <Label htmlFor="city-filter">City</Label>
                  <Input
                    id="city-filter"
                    placeholder="e.g. Mumbai, Delhi, Surat"
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={() => setStep(3)}>
                Next: Select Template →
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 3: Template & Media Selection */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Select WhatsApp Template</CardTitle>
            <CardDescription>
              Only Admin-approved broadcast templates can be used.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {approvedTemplates.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground border rounded-lg">
                No approved templates available. Please create and approve a
                template first.
                <div className="mt-3">
                  <Link href="/whatsapp/campaigns/templates">
                    <Button size="sm">Manage Templates</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Approved Template *</Label>
                  <Select value={templateId} onValueChange={setTemplateId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      {approvedTemplates.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedTemplate && (
                  <div className="p-4 rounded-lg bg-muted text-xs font-mono whitespace-pre-wrap">
                    {selectedTemplate.content}
                  </div>
                )}

                {/* Media Attachment */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="attach-media"
                      checked={hasMedia}
                      onCheckedChange={(chk) => setHasMedia(!!chk)}
                    />
                    <Label
                      htmlFor="attach-media"
                      className="font-semibold cursor-pointer"
                    >
                      Attach Media Header (Image, Catalogue PDF, or Video)
                    </Label>
                  </div>

                  {hasMedia && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-lg border bg-muted/30">
                      <div className="space-y-1">
                        <Label className="text-xs">Media Type</Label>
                        <Select
                          value={mediaType}
                          onValueChange={(val: any) => setMediaType(val)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="image">
                              Image (JPG/PNG)
                            </SelectItem>
                            <SelectItem value="pdf">Catalogue (PDF)</SelectItem>
                            <SelectItem value="video">Video (MP4)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <Label className="text-xs">
                          Media File URL / Cloud URL
                        </Label>
                        <Input
                          placeholder="https://example.com/catalogue.pdf"
                          value={mediaUrl}
                          onChange={(e) => setMediaUrl(e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={() => setStep(4)} disabled={!templateId}>
                Next: Schedule & Review →
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 4: Schedule & Launch */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Schedule & Confirm</CardTitle>
            <CardDescription>
              Choose when this campaign should be broadcasted.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSendOption("now")}
                className={`p-4 rounded-xl border text-left transition-all ${
                  sendOption === "now"
                    ? "border-primary bg-primary-50 dark:bg-muted font-semibold"
                    : "border-border hover:bg-muted/40"
                }`}
              >
                <Send className="h-5 w-5 text-primary mb-2" />
                <h4 className="text-sm font-bold">Send Immediately</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isAdmin
                    ? "Start broadcasting messages in queue right now."
                    : "Submit to Admin for approval to send immediately."}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSendOption("later")}
                className={`p-4 rounded-xl border text-left transition-all ${
                  sendOption === "later"
                    ? "border-primary bg-primary-50 dark:bg-muted font-semibold"
                    : "border-border hover:bg-muted/40"
                }`}
              >
                <Calendar className="h-5 w-5 text-primary mb-2" />
                <h4 className="text-sm font-bold">Schedule for Later</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Queue the broadcast for a future date and time.
                </p>
              </button>
            </div>

            {sendOption === "later" && (
              <div className="space-y-1.5 max-w-sm pt-2">
                <Label htmlFor="sched-date">Scheduled Date & Time *</Label>
                <Input
                  id="sched-date"
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setStep(3)}>
                Back
              </Button>
              <Button onClick={() => setStep(5)}>Next: Final Preview →</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 5: Final Review & Submit */}
      {step === 5 && (
        <Card>
          <CardHeader>
            <CardTitle>Campaign Summary & Confirmation</CardTitle>
            <CardDescription>
              Review all details before creating this campaign.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Campaign Name:</span>
                <span className="font-bold text-foreground">{name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Selected Template:
                </span>
                <span className="font-medium text-foreground">
                  {selectedTemplate?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Audience Type:</span>
                <span className="capitalize font-medium text-foreground">
                  {audienceType}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery:</span>
                <span className="font-medium text-foreground">
                  {sendOption === "now"
                    ? "Send immediately upon approval"
                    : `Scheduled for ${scheduledAt}`}
                </span>
              </div>
              {hasMedia && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Media Attachment:
                  </span>
                  <span className="font-medium text-foreground uppercase">
                    {mediaType}
                  </span>
                </div>
              )}
            </div>

            <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
              {isAdmin
                ? "As an Administrator, this campaign will be automatically approved and scheduled/queued."
                : "This campaign will be submitted to the Admin for final broadcast approval."}
            </div>

            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setStep(4)}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting
                  ? "Submitting Campaign..."
                  : isAdmin
                    ? "Launch Broadcast Campaign"
                    : "Submit for Admin Approval"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
