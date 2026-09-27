"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

type CampaignStatus = Database["public"]["Enums"]["campaign_status"];
type TemplateStatus = Database["public"]["Enums"]["template_status"];

// ─── TEMPLATES ───────────────────────────────────────────────────

export async function fetchTemplates() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("whatsapp_templates")
    .select(
      `
      *,
      creator:profiles!created_by(id, full_name),
      approver:profiles!approved_by(id, full_name)
    `,
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function createTemplate(name: string, content: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("user_id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";

  const { data, error } = await supabase
    .from("whatsapp_templates")
    .insert({
      name,
      content,
      created_by: profile?.id || null,
      status: isAdmin ? "approved" : "pending",
      approved_by: isAdmin ? profile?.id : null,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/whatsapp/campaigns/templates");
  return { data };
}

export async function updateTemplateStatus(
  templateId: string,
  status: TemplateStatus,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("user_id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Only administrators can approve or reject templates." };
  }

  const { error } = await supabase
    .from("whatsapp_templates")
    .update({
      status,
      approved_by: status === "approved" ? profile.id : null,
    })
    .eq("id", templateId);

  if (error) return { error: error.message };
  revalidatePath("/whatsapp/campaigns/templates");
  return { success: true };
}

// ─── CAMPAIGNS ───────────────────────────────────────────────────

export async function fetchCampaigns() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("campaigns")
    .select(
      `
      *,
      template:whatsapp_templates(id, name, content),
      creator:profiles!created_by(id, full_name),
      approver:profiles!approved_by(id, full_name),
      recipients:campaign_recipients(id, status, read_at, replied_at, delivered_at)
    `,
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function fetchCampaignDetails(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("campaigns")
    .select(
      `
      *,
      template:whatsapp_templates(id, name, content),
      creator:profiles!created_by(id, full_name),
      approver:profiles!approved_by(id, full_name),
      media:campaign_media(id, media_type, file_url, file_name),
      recipients:campaign_recipients(
        id,
        status,
        sent_at,
        delivered_at,
        read_at,
        replied_at,
        failed_at,
        customer:customers(id, name, company, email, phones:customer_phones(phone_number))
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createCampaign(params: {
  name: string;
  description?: string;
  template_id: string;
  audience_type: "all" | "filtered";
  audience_filters?: {
    tag_ids?: string[];
    status?: string[];
    city?: string;
  };
  media?: {
    media_type: "pdf" | "image" | "video";
    file_url: string;
    file_name: string;
  }[];
  schedule_now?: boolean;
  scheduled_at?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("user_id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";

  // Determine audience target customer IDs
  let query = supabase
    .from("customers")
    .select("id, whatsapp_identities(id)")
    .is("archived_at", null)
    .eq("marketing_opt_out", false);

  if (params.audience_type === "filtered" && params.audience_filters) {
    if (
      params.audience_filters.status &&
      params.audience_filters.status.length > 0
    ) {
      query = query.in("status", params.audience_filters.status as any);
    }
    if (params.audience_filters.city) {
      query = query.ilike("city", `%${params.audience_filters.city}%`);
    }
    if (
      params.audience_filters.tag_ids &&
      params.audience_filters.tag_ids.length > 0
    ) {
      const { data: tagCustomers } = await supabase
        .from("customer_tags")
        .select("customer_id")
        .in("tag_id", params.audience_filters.tag_ids);
      const cids = (tagCustomers ?? []).map((tc) => tc.customer_id);
      if (cids.length === 0)
        return { error: "No customers matched the selected tags." };
      query = query.in("id", cids);
    }
  }

  const { data: targetCustomers } = await query;
  if (!targetCustomers || targetCustomers.length === 0) {
    return { error: "No customers found for this audience criteria." };
  }

  // Initial status: Admin self-approved if desired or draft/pending_approval
  const initialStatus: CampaignStatus = isAdmin
    ? params.schedule_now
      ? "running"
      : params.scheduled_at
        ? "scheduled"
        : "approved"
    : "pending_approval";

  // Insert Campaign
  const { data: campaign, error: campError } = await supabase
    .from("campaigns")
    .insert({
      name: params.name,
      description: params.description || null,
      template_id: params.template_id,
      status: initialStatus,
      created_by: profile?.id || null,
      approved_by: isAdmin ? profile?.id : null,
      scheduled_at: params.scheduled_at || null,
      started_at: initialStatus === "running" ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (campError) return { error: campError.message };

  // Insert Campaign Media if provided
  if (params.media && params.media.length > 0) {
    await supabase.from("campaign_media").insert(
      params.media.map((m) => ({
        campaign_id: campaign.id,
        media_type: m.media_type,
        file_url: m.file_url,
        file_name: m.file_name,
      })),
    );
  }

  // Insert Recipients (Respect UNIQUE(campaign_id, customer_id))
  const recipientInserts: Database["public"]["Tables"]["campaign_recipients"]["Insert"][] =
    targetCustomers.map((cust) => ({
      campaign_id: campaign.id,
      customer_id: cust.id,
      whatsapp_identity_id: cust.whatsapp_identities?.[0]?.id || null,
      status: initialStatus === "running" ? "sending" : "pending",
      sent_at: initialStatus === "running" ? new Date().toISOString() : null,
    }));

  await supabase.from("campaign_recipients").insert(recipientInserts);

  // Log activity
  if (profile) {
    await supabase.from("activities").insert({
      user_id: profile.id,
      activity_type: "campaign_created",
      description: `Created campaign "${campaign.name}" (${recipientInserts.length} recipients)`,
    });
  }

  revalidatePath("/whatsapp/campaigns");
  return { data: campaign };
}

export async function approveCampaign(campaignId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("user_id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Only administrators can approve campaigns." };
  }

  const { error } = await supabase
    .from("campaigns")
    .update({
      status: "approved",
      approved_by: profile.id,
    })
    .eq("id", campaignId);

  if (error) return { error: error.message };
  revalidatePath(`/whatsapp/campaigns/${campaignId}`);
  revalidatePath("/whatsapp/campaigns");
  return { success: true };
}

export async function startOrScheduleCampaign(
  campaignId: string,
  sendNow = true,
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("campaigns")
    .update({
      status: sendNow ? "running" : "scheduled",
      started_at: sendNow ? new Date().toISOString() : null,
    })
    .eq("id", campaignId);

  if (error) return { error: error.message };

  if (sendNow) {
    // Mark pending recipients as sent/sending
    await supabase
      .from("campaign_recipients")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        delivered_at: new Date().toISOString(),
      })
      .eq("campaign_id", campaignId)
      .eq("status", "pending");
  }

  revalidatePath(`/whatsapp/campaigns/${campaignId}`);
  revalidatePath("/whatsapp/campaigns");
  return { success: true };
}

export async function pauseOrCancelCampaign(
  campaignId: string,
  action: "paused" | "cancelled",
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("campaigns")
    .update({ status: action })
    .eq("id", campaignId);

  if (error) return { error: error.message };
  revalidatePath(`/whatsapp/campaigns/${campaignId}`);
  revalidatePath("/whatsapp/campaigns");
  return { success: true };
}
