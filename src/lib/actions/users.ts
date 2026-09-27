"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

export async function fetchUsers() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (currentProfile?.role !== "admin") {
    throw new Error("Forbidden: Admin access required.");
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function updateUserRole(
  profileId: string,
  newRole: "admin" | "salesperson",
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (currentProfile?.role !== "admin") {
    return { error: "Forbidden: Admin access required." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role: newRole })
    .eq("id", profileId);

  if (error) return { error: error.message };
  revalidatePath("/settings/users");
  return { success: true };
}

export async function toggleUserActive(profileId: string, isActive: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (currentProfile?.role !== "admin") {
    return { error: "Forbidden: Admin access required." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ is_active: isActive })
    .eq("id", profileId);

  if (error) return { error: error.message };
  revalidatePath("/settings/users");
  return { success: true };
}

export async function deleteTag(tagId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("tags").delete().eq("id", tagId);
  if (error) return { error: error.message };
  revalidatePath("/settings/tags");
  return { success: true };
}
