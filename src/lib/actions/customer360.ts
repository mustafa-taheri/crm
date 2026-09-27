"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function fetchCustomer360(customerId: string) {
  const supabase = await createClient();

  const [
    { data: customer, error: customerError },
    { data: conversation },
    { data: activities },
    { data: notes },
    { data: followups },
    { data: campaignRecipients },
  ] = await Promise.all([
    supabase
      .from("customers")
      .select(
        `
        *,
        primary_owner:profiles!primary_owner_id(id, full_name),
        phones:customer_phones(id, phone_number, country_code, is_primary),
        tags:customer_tags(tag:tags(id, name))
      `,
      )
      .eq("id", customerId)
      .single(),

    supabase
      .from("conversations")
      .select(
        `
        id,
        state,
        unread_count,
        last_message_at,
        last_customer_message_at,
        assigned_user:profiles(id, full_name),
        messages(
          id,
          direction,
          message_type,
          content,
          status,
          created_at,
          sender:profiles(id, full_name)
        )
      `,
      )
      .eq("customer_id", customerId)
      .maybeSingle(),

    supabase
      .from("activities")
      .select(
        `
        id,
        activity_type,
        description,
        metadata,
        created_at,
        user:profiles(id, full_name)
      `,
      )
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false }),

    supabase
      .from("notes")
      .select(
        `
        id,
        content,
        created_at,
        creator:profiles!created_by(id, full_name)
      `,
      )
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false }),

    supabase
      .from("followups")
      .select(
        `
        id,
        description,
        due_date,
        due_time,
        priority,
        status,
        completed_at,
        created_at,
        assigned_user:profiles!assigned_user_id(id, full_name)
      `,
      )
      .eq("customer_id", customerId)
      .order("due_date", { ascending: true }),

    supabase
      .from("campaign_recipients")
      .select(
        `
        id,
        status,
        sent_at,
        delivered_at,
        read_at,
        replied_at,
        failed_at,
        campaign:campaigns(id, name, created_at)
      `,
      )
      .eq("customer_id", customerId)
      .order("sent_at", { ascending: false, nullsFirst: false }),
  ]);

  if (customerError || !customer) {
    throw new Error("Customer not found");
  }

  return {
    customer,
    conversation,
    activities: activities ?? [],
    notes: notes ?? [],
    followups: followups ?? [],
    campaignRecipients: campaignRecipients ?? [],
  };
}

export async function addCustomerNote(customerId: string, content: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  const { data: note, error } = await supabase
    .from("notes")
    .insert({
      customer_id: customerId,
      created_by: profile?.id || null,
      content,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  // Activity log
  if (profile) {
    await supabase.from("activities").insert({
      customer_id: customerId,
      user_id: profile.id,
      activity_type: "note_added",
      description: `Added an internal note`,
    });
  }

  revalidatePath(`/customers/${customerId}`);
  return { data: note };
}
