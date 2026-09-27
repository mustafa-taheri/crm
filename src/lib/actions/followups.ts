"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { followupSchema } from "@/lib/validators/followup";
import type { Database } from "@/types/supabase";

type FollowupStatus = Database["public"]["Enums"]["followup_status"];
type FollowupPriority = Database["public"]["Enums"]["followup_priority"];

export async function fetchFollowups(
  filter: "all" | "today" | "upcoming" | "overdue" | "completed" = "all",
) {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  let query = supabase.from("followups").select(`
      *,
      customer:customers(id, name, company, city, status, phones:customer_phones(phone_number, country_code, is_primary)),
      assigned_user:profiles!assigned_user_id(id, full_name),
      creator:profiles!created_by(id, full_name)
    `);

  if (filter === "today") {
    query = query.eq("status", "pending").eq("due_date", today);
  } else if (filter === "upcoming") {
    query = query.eq("status", "pending").gt("due_date", today);
  } else if (filter === "overdue") {
    query = query.eq("status", "pending").lt("due_date", today);
  } else if (filter === "completed") {
    query = query.eq("status", "completed");
  }

  query = query
    .order("due_date", { ascending: true })
    .order("due_time", { ascending: true, nullsFirst: false });

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function createFollowup(formData: FormData) {
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

  const raw = Object.fromEntries(formData);
  const parsed = followupSchema.safeParse({
    customer_id: raw.customer_id,
    description: raw.description,
    due_date: raw.due_date,
    due_time: raw.due_time || null,
    assigned_user_id:
      raw.assigned_user_id && raw.assigned_user_id !== "none"
        ? raw.assigned_user_id
        : profile?.id,
    priority: raw.priority || "medium",
    reminder_minutes: raw.reminder_minutes
      ? parseInt(raw.reminder_minutes as string, 10)
      : 30,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { data: followup, error } = await supabase
    .from("followups")
    .insert({
      customer_id: parsed.data.customer_id,
      description: parsed.data.description,
      due_date: parsed.data.due_date,
      due_time: parsed.data.due_time || null,
      assigned_user_id: parsed.data.assigned_user_id || null,
      priority: parsed.data.priority,
      reminder_minutes: parsed.data.reminder_minutes,
      status: "pending",
      created_by: profile?.id || null,
    })
    .select()
    .single();

  if (error) return { error: { _root: [error.message] } };

  // Log activity
  if (profile) {
    await supabase.from("activities").insert({
      customer_id: parsed.data.customer_id,
      user_id: profile.id,
      activity_type: "followup_created",
      description: `Scheduled follow-up: "${parsed.data.description}" for ${parsed.data.due_date}`,
    });
  }

  revalidatePath("/follow-ups");
  revalidatePath(`/customers/${parsed.data.customer_id}`);
  return { data: followup };
}

export async function completeFollowup(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user?.id || "")
    .single();

  const { data: followup } = await supabase
    .from("followups")
    .select("customer_id, description")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("followups")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };

  if (profile && followup) {
    await supabase.from("activities").insert({
      customer_id: followup.customer_id,
      user_id: profile.id,
      activity_type: "followup_completed",
      description: `Completed follow-up: "${followup.description}"`,
    });
  }

  revalidatePath("/follow-ups");
  if (followup) revalidatePath(`/customers/${followup.customer_id}`);
  return { success: true };
}

export async function reopenFollowup(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("followups")
    .update({
      status: "pending",
      completed_at: null,
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/follow-ups");
  return { success: true };
}

export async function reassignFollowup(
  id: string,
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

  const { data: followup } = await supabase
    .from("followups")
    .select("customer_id, description")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("followups")
    .update({ assigned_user_id: assignedUserId })
    .eq("id", id);

  if (error) return { error: error.message };

  if (profile && followup) {
    await supabase.from("activities").insert({
      customer_id: followup.customer_id,
      user_id: profile.id,
      activity_type: "followup_reassigned",
      description: `Reassigned follow-up: "${followup.description}"`,
    });
  }

  revalidatePath("/follow-ups");
  return { success: true };
}
