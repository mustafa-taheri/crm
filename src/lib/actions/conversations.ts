"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { whatsAppService } from "@/lib/whatsapp/service";
import type { Database } from "@/types/supabase";

export async function fetchConversations(
  filter: "all" | "unread" | "mine" = "all",
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

  let query = supabase
    .from("conversations")
    .select(
      `
      id,
      state,
      unread_count,
      last_message_at,
      last_customer_message_at,
      assigned_user_id,
      customer:customers!customer_id(
        id,
        name,
        company,
        email,
        city,
        status,
        phones:customer_phones!customer_id(phone_number, country_code, is_primary),
        tags:customer_tags!customer_id(tag:tags!tag_id(id, name))
      ),
      assigned_user:profiles!assigned_user_id(id, full_name),
      messages:messages!conversation_id(id, content, direction, message_type, created_at, status)
    `,
    )
    .eq("state", "open")
    .order("last_message_at", { ascending: false, nullsFirst: false });

  if (filter === "unread") {
    query = query.gt("unread_count", 0);
  } else if (filter === "mine" && profile) {
    query = query.eq("assigned_user_id", profile.id);
  }

  const { data, error } = await query;
  if (!error && data) return data;

  // Fallback: If PostgREST relationship fails (PGRST200 / stale cache), fetch and assemble manually
  let fallbackQuery = supabase
    .from("conversations")
    .select("*")
    .eq("state", "open")
    .order("last_message_at", { ascending: false, nullsFirst: false });

  if (filter === "unread") {
    fallbackQuery = fallbackQuery.gt("unread_count", 0);
  } else if (filter === "mine" && profile) {
    fallbackQuery = fallbackQuery.eq("assigned_user_id", profile.id);
  }

  const { data: rawConvs, error: rawError } = await fallbackQuery;
  if (rawError) throw rawError;
  if (!rawConvs || rawConvs.length === 0) return [];

  const customerIds = Array.from(new Set(rawConvs.map((c) => c.customer_id).filter(Boolean)));
  const userIds = Array.from(new Set(rawConvs.map((c) => c.assigned_user_id).filter(Boolean))) as string[];
  const convIds = rawConvs.map((c) => c.id);

  const [{ data: customers }, { data: phones }, { data: tags }, { data: profiles }, { data: messages }] =
    await Promise.all([
      customerIds.length > 0
        ? supabase.from("customers").select("*").in("id", customerIds)
        : Promise.resolve({ data: [] }),
      customerIds.length > 0
        ? supabase.from("customer_phones").select("*").in("customer_id", customerIds)
        : Promise.resolve({ data: [] }),
      customerIds.length > 0
        ? supabase.from("customer_tags").select("customer_id, tag:tags(*)").in("customer_id", customerIds)
        : Promise.resolve({ data: [] }),
      userIds.length > 0
        ? supabase.from("profiles").select("id, full_name").in("id", userIds)
        : Promise.resolve({ data: [] }),
      convIds.length > 0
        ? supabase
            .from("messages")
            .select("id, conversation_id, content, direction, message_type, created_at, status")
            .in("conversation_id", convIds)
            .order("created_at", { ascending: true })
        : Promise.resolve({ data: [] }),
    ]);

  const customerMap = new Map(
    (customers || []).map((c) => [
      c.id,
      {
        ...c,
        phones: (phones || []).filter((p) => p.customer_id === c.id),
        tags: (tags || []).filter((t: any) => t.customer_id === c.id),
      },
    ]),
  );
  const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

  return rawConvs.map((conv) => ({
    ...conv,
    customer: customerMap.get(conv.customer_id) || null,
    assigned_user: conv.assigned_user_id ? profileMap.get(conv.assigned_user_id) || null : null,
    messages: (messages || []).filter((m) => m.conversation_id === conv.id),
  }));
}

export async function fetchConversationDetails(conversationId: string) {
  const supabase = await createClient();

  // Mark unread as 0 when opening
  await supabase
    .from("conversations")
    .update({ unread_count: 0 })
    .eq("id", conversationId);

  const { data, error } = await supabase
    .from("conversations")
    .select(
      `
      id,
      state,
      unread_count,
      last_message_at,
      last_customer_message_at,
      assigned_user_id,
      customer:customers!customer_id(
        id,
        name,
        company,
        email,
        city,
        status,
        phones:customer_phones!customer_id(phone_number, country_code, is_primary),
        tags:customer_tags!customer_id(tag:tags!tag_id(id, name))
      ),
      assigned_user:profiles!assigned_user_id(id, full_name),
      messages:messages!conversation_id(
        id,
        content,
        direction,
        message_type,
        status,
        created_at,
        sender:profiles!sender_user_id(id, full_name),
        media:message_media!message_id(id, media_type, file_url, file_name, mime_type)
      )
    `,
    )
    .eq("id", conversationId)
    .single();

  if (!error && data) return data;

  // Fallback: Fetch conversation, customer, phones, tags, messages separately
  const { data: conv, error: convErr } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .single();

  if (convErr) throw convErr;

  const [
    { data: customer },
    { data: phones },
    { data: tags },
    { data: assignedUser },
    { data: messages },
  ] = await Promise.all([
    conv.customer_id
      ? supabase.from("customers").select("*").eq("id", conv.customer_id).maybeSingle()
      : Promise.resolve({ data: null }),
    conv.customer_id
      ? supabase.from("customer_phones").select("*").eq("customer_id", conv.customer_id)
      : Promise.resolve({ data: [] }),
    conv.customer_id
      ? supabase.from("customer_tags").select("customer_id, tag:tags(*)").eq("customer_id", conv.customer_id)
      : Promise.resolve({ data: [] }),
    conv.assigned_user_id
      ? supabase.from("profiles").select("id, full_name").eq("id", conv.assigned_user_id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("messages")
      .select("*, media:message_media(*)")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true }),
  ]);

  return {
    ...conv,
    customer: customer
      ? {
          ...customer,
          phones: phones || [],
          tags: tags || [],
        }
      : null,
    assigned_user: assignedUser || null,
    messages: messages || [],
  };
}

export async function getOrCreateConversationForCustomer(customerId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profileId: string | null = null;
  if (user?.id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    profileId = profile?.id || null;
  }

  // Check if existing open conversation exists
  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("customer_id", customerId)
    .eq("state", "open")
    .maybeSingle();

  if (existing) return existing.id;

  // Create new conversation
  const { data: created, error } = await supabase
    .from("conversations")
    .insert({
      customer_id: customerId,
      assigned_user_id: profileId,
      state: "open",
      last_message_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) throw error;
  return created.id;
}

export async function sendMessage(
  conversationId: string,
  content: string,
  mediaType?: string,
  fileUrl?: string,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("user_id", user.id)
    .single();

  const { data: conv } = await supabase
    .from("conversations")
    .select("id, customer_id, last_customer_message_at")
    .eq("id", conversationId)
    .single();

  if (!conv) throw new Error("Conversation not found");

  // Check 24-hour WhatsApp messaging window
  const isOutsideWindow =
    !conv.last_customer_message_at ||
    Date.now() - new Date(conv.last_customer_message_at).getTime() >
      24 * 60 * 60 * 1000;

  // WhatsApp Policy: Free-form messages are strictly forbidden outside the 24-hour window
  if (isOutsideWindow) {
    return {
      success: false,
      isOutsideWindow: true,
      error:
        "The 24-hour WhatsApp messaging window has expired. WhatsApp policy requires sending an approved template to re-open the conversation.",
    };
  }

  // Fetch customer's primary phone number
  const { data: phones } = await supabase
    .from("customer_phones")
    .select("phone_number, country_code, is_primary")
    .eq("customer_id", conv.customer_id);

  const phoneRecord =
    phones?.find((p) => p.is_primary) || phones?.[0];

  if (!phoneRecord?.phone_number) {
    return {
      success: false,
      error: "Customer does not have a registered phone number.",
    };
  }

  const recipientPhone = `${phoneRecord.country_code || "+91"}${phoneRecord.phone_number}`;

  // Dispatch message via Meta WhatsApp Cloud API service
  let dispatchRes;
  if (fileUrl && mediaType) {
    dispatchRes = await whatsAppService.sendMedia(
      recipientPhone,
      mediaType as "image" | "document" | "video",
      fileUrl,
      content,
    );
  } else {
    dispatchRes = await whatsAppService.sendText(recipientPhone, content);
  }

  if (!dispatchRes.success) {
    if (dispatchRes.isOptedOut) {
      await supabase
        .from("customers")
        .update({ marketing_opt_out: true })
        .eq("id", conv.customer_id);
    }
    return {
      success: false,
      isOutsideWindow: dispatchRes.isOutsideWindow,
      error: dispatchRes.error || "Failed to dispatch message via WhatsApp.",
    };
  }

  // Insert message record
  const { data: message, error: msgError } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      customer_id: conv.customer_id,
      sender_user_id: profile?.id || null,
      direction: "outbound",
      message_type:
        (mediaType as Database["public"]["Enums"]["message_type"]) || "text",
      content,
      whatsapp_message_id: dispatchRes.messageId || null,
      status: "sent",
      sent_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (msgError) throw msgError;

  // If media attached
  if (fileUrl && mediaType) {
    await supabase.from("message_media").insert({
      message_id: message.id,
      media_type: mediaType as "image" | "video" | "document" | "pdf",
      file_url: fileUrl,
    });
  }

  // Update conversation last_message_at
  await supabase
    .from("conversations")
    .update({
      last_message_at: new Date().toISOString(),
    })
    .eq("id", conversationId);

  // Activity log
  if (profile) {
    await supabase.from("activities").insert({
      customer_id: conv.customer_id,
      conversation_id: conversationId,
      user_id: profile.id,
      activity_type: "message_sent",
      description: `Sent message: "${content.slice(0, 40)}${content.length > 40 ? "..." : ""}"`,
    });
  }

  revalidatePath("/whatsapp/inbox");
  return { success: true, isOutsideWindow: false };
}

export async function sendTemplateMessage(
  conversationId: string,
  templateId: string,
  variables: string[] = [],
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("user_id", user.id)
    .single();

  const { data: conv } = await supabase
    .from("conversations")
    .select("id, customer_id")
    .eq("id", conversationId)
    .single();

  if (!conv) return { success: false, error: "Conversation not found" };

  const { data: customer } = await supabase
    .from("customers")
    .select("id, name, marketing_opt_out")
    .eq("id", conv.customer_id)
    .single();

  if (!customer) return { success: false, error: "Customer not found" };

  if (customer.marketing_opt_out) {
    return {
      success: false,
      error:
        "Customer has opted out of WhatsApp messages. Template messages cannot be sent to opted-out contacts.",
    };
  }

  const { data: template } = await supabase
    .from("whatsapp_templates")
    .select("*")
    .eq("id", templateId)
    .single();

  if (!template) return { success: false, error: "Template not found" };

  if (template.status !== "approved") {
    return {
      success: false,
      error: "Only approved WhatsApp templates can be sent.",
    };
  }

  const { data: phones } = await supabase
    .from("customer_phones")
    .select("phone_number, country_code, is_primary")
    .eq("customer_id", conv.customer_id);

  const phoneRecord =
    phones?.find((p) => p.is_primary) || phones?.[0];

  if (!phoneRecord?.phone_number) {
    return {
      success: false,
      error: "Customer does not have a registered phone number.",
    };
  }

  const recipientPhone = `${phoneRecord.country_code || "+91"}${phoneRecord.phone_number}`;

  const templateVars =
    variables.length > 0 ? variables : [customer.name || "Customer"];

  let renderedContent = template.content;
  templateVars.forEach((val, idx) => {
    renderedContent = renderedContent.replace(
      new RegExp(`\\{\\{${idx + 1}\\}\\}`, "g"),
      val,
    );
  });

  const dispatchRes = await whatsAppService.sendTemplate(
    recipientPhone,
    template.name,
    "en",
    templateVars,
  );

  if (!dispatchRes.success) {
    if (dispatchRes.isOptedOut) {
      await supabase
        .from("customers")
        .update({ marketing_opt_out: true })
        .eq("id", conv.customer_id);
    }
    return {
      success: false,
      error:
        dispatchRes.error || "Failed to dispatch template message via WhatsApp.",
    };
  }

  const { data: message, error: msgError } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      customer_id: conv.customer_id,
      sender_user_id: profile?.id || null,
      direction: "outbound",
      message_type: "text",
      content: renderedContent,
      whatsapp_message_id: dispatchRes.messageId || null,
      status: "sent",
      sent_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (msgError) return { success: false, error: msgError.message };

  await supabase
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", conversationId);

  if (profile) {
    await supabase.from("activities").insert({
      customer_id: conv.customer_id,
      conversation_id: conversationId,
      user_id: profile.id,
      activity_type: "message_sent",
      description: `Sent approved WhatsApp template: "${template.name}"`,
    });
  }

  revalidatePath("/whatsapp/inbox");
  return { success: true, messageId: message.id };
}

export async function assignConversation(
  conversationId: string,
  assignedUserId: string | null,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user?.id || "")
    .single();

  const { data: conv } = await supabase
    .from("conversations")
    .select("customer_id")
    .eq("id", conversationId)
    .single();

  await supabase
    .from("conversations")
    .update({ assigned_user_id: assignedUserId })
    .eq("id", conversationId);

  if (profile && conv) {
    await supabase.from("activities").insert({
      customer_id: conv.customer_id,
      conversation_id: conversationId,
      user_id: profile.id,
      activity_type: "conversation_assigned",
      description: `Conversation reassigned`,
    });
  }

  revalidatePath("/whatsapp/inbox");
  return { success: true };
}
