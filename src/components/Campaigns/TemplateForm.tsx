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
import { createTemplate } from "@/lib/actions/campaigns";
import { Plus } from "lucide-react";

export function TemplateForm() {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [content, setContent] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await createTemplate(name.trim(), content.trim());
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setName("");
        setContent("");
        setIsOpen(false);
        router.refresh();
      }
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || "Failed to create template");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} size="sm">
        <Plus className="mr-1.5 h-4 w-4" />
        New WhatsApp Template
      </Button>
    );
  }

  return (
    <Card className="border-primary/30 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">
          Create WhatsApp Broadcast Template
        </CardTitle>
        <CardDescription>
          Templates require Admin approval before they can be broadcasted to
          customers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded bg-error/10 text-error text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="tpl-name">Template Name *</Label>
            <Input
              id="tpl-name"
              placeholder="e.g. diwali_corporate_gifting_2026"
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
                )
              }
              maxLength={128}
              required
            />
            <p className="text-[11px] text-muted-foreground">
              Meta WhatsApp API requires lowercase alphanumeric characters and underscores only (e.g. <code>festive_promo_offer</code>).
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tpl-content">Template Content *</Label>
            <Textarea
              id="tpl-content"
              placeholder="Hello {{1}}, explore our exclusive corporate gifting collection for this festive season! Reply STOP to opt out."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] text-sm"
              required
            />
            <div className="rounded-md bg-blue-50/60 dark:bg-blue-950/30 p-2.5 border border-blue-200/60 dark:border-blue-800 text-[11px] text-blue-900 dark:text-blue-300 space-y-1">
              <p className="font-semibold">WhatsApp Compliance Policy Guideline:</p>
              <p>
                - Use <code>&#123;&#123;1&#125;&#125;</code> for custom variables (e.g. Customer Name).
              </p>
              <p>
                - Always include an opt-out instruction (e.g. <em>&quot;Reply STOP to unsubscribe&quot;</em>) in promotional messages to protect your phone number Quality Rating and prevent account suspension.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? "Submitting..." : "Submit for Approval"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
