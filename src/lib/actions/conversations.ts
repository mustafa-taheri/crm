"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

type ConversationState = Database["public"]["Enums"]["conversation_state"];

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
      customer:customers(
        id,
        name,
        company,
        email,
        city,
        status,
        phones:customer_phones(phone_number, country_code, is_primary),
        tags:customer_tags(tag:tags(id, name))
      ),
      assigned_user:profiles(id, full_name),
      messages(id, content, direction, message_type, created_at, status)
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
  if (error) throw error;
  return data ?? [];
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
      customer:customers(
        id,
        name,
        company,
        email,
        city,
        status,
        phones:customer_phones(phone_number, country_code, is_primary),
        tags:customer_tags(tag:tags(id, name))
      ),
      assigned_user:profiles(id, full_name),
      messages(
        id,
        content,
        direction,
        message_type,
        status,
        created_at,
        sender:profiles(id, full_name),
        media:message_media(id, media_type, file_url, file_name, mime_type)
      )
    `,
    )
    .eq("id", conversationId)
    .single();

  if (error) throw error;
  return data;
}

export async function getOrCreateConversationForCustomer(customerId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user?.id || "")
    .maybeSingle();

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
      assigned_user_id: profile?.id || null,
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

  // Insert message record
  const { data: message, error: msgError } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      customer_id: conv.customer_id,
      sender_user_id: profile?.id || null,
      direction: "outbound",
      message_type: (mediaType as any) || "text",
      content,
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
      media_type: mediaType as any,
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
  return { success: true, isOutsideWindow };
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
