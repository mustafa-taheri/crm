"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { customerSchema } from "@/lib/validators/customer";
import type { Database } from "@/types/supabase";

type CustomerStatus = Database["public"]["Enums"]["customer_status"];

// ─── Helpers ─────────────────────────────────────────────────────
async function getProfile(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("user_id", user.id)
    .single();
  if (!profile) throw new Error("Profile not found");
  return profile;
}

// ─── List customers ──────────────────────────────────────────────
export async function fetchCustomers(params: {
  search?: string;
  status?: CustomerStatus;
  tag_id?: string;
  city?: string;
  owner_id?: string;
  archived?: boolean;
  page?: number;
  per_page?: number;
}) {
  const supabase = await createClient();
  const {
    search,
    status,
    tag_id,
    city,
    owner_id,
    archived = false,
    page = 1,
    per_page = 50,
  } = params;

  let query = supabase.from("customers").select(
    `
      *,
      primary_owner:profiles!primary_owner_id(id, full_name),
      phones:customer_phones(id, phone_number, country_code, is_primary),
      tags:customer_tags(tag:tags(id, name))
    `,
    { count: "exact" },
  );

  if (archived) {
    query = query.not("archived_at", "is", null);
  } else {
    query = query.is("archived_at", null);
  }

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,company.ilike.%${search}%,email.ilike.%${search}%`,
    );
  }
  if (status) query = query.eq("status", status);
  if (city) query = query.ilike("city", `%${city}%`);
  if (owner_id) query = query.eq("primary_owner_id", owner_id);
  if (tag_id) {
    const { data: tagCustomerIds } = await supabase
      .from("customer_tags")
      .select("customer_id")
      .eq("tag_id", tag_id);
    const ids = (tagCustomerIds ?? []).map((r) => r.customer_id);
    if (ids.length === 0) return { data: [], count: 0 };
    query = query.in("id", ids);
  }

  const from = (page - 1) * per_page;
  query = query
    .range(from, from + per_page - 1)
    .order("created_at", { ascending: false });

  const { data, count, error } = await query;
  if (error) throw error;
  return { data: data ?? [], count: count ?? 0 };
}

// ─── Create customer ─────────────────────────────────────────────
export async function createCustomer(formData: FormData) {
  const supabase = await createClient();
  const profile = await getProfile(supabase);

  const raw = Object.fromEntries(formData);
  const phones = JSON.parse((raw.phones as string) || "[]");
  const tag_ids = JSON.parse((raw.tag_ids as string) || "[]");

  const parsed = customerSchema.safeParse({ ...raw, phones, tag_ids });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const {
    name,
    email,
    company,
    city,
    industry,
    source,
    status,
    primary_owner_id,
    marketing_opt_out,
  } = parsed.data;

  const { data: customer, error } = await supabase
    .from("customers")
    .insert({
      name,
      email: email || null,
      company: company || null,
      city: city || null,
      industry: industry || null,
      source: source || null,
      status: status ?? "new_reply",
      primary_owner_id: primary_owner_id ?? null,
      marketing_opt_out: marketing_opt_out ?? false,
    })
    .select("id")
    .single();

  if (error) return { error: { _root: [error.message] } };

  // Insert phones
  if (parsed.data.phones.length > 0) {
    await supabase.from("customer_phones").insert(
      parsed.data.phones.map((p, i) => ({
        customer_id: customer.id,
        phone_number: p.phone_number,
        country_code: p.country_code,
        is_primary: i === 0 || p.is_primary,
      })),
    );
  }

  // Insert tags
  if (tag_ids.length > 0) {
    await supabase
      .from("customer_tags")
      .insert(
        tag_ids.map((tid: string) => ({
          customer_id: customer.id,
          tag_id: tid,
        })),
      );
  }

  // Activity log
  await supabase.from("activities").insert({
    customer_id: customer.id,
    user_id: profile.id,
    activity_type: "customer_created",
    description: `Customer "${name}" created`,
  });

  revalidatePath("/customers");
  return { data: customer };
}

// ─── Update customer ─────────────────────────────────────────────
export async function updateCustomer(id: string, formData: FormData) {
  const supabase = await createClient();
  const profile = await getProfile(supabase);

  const raw = Object.fromEntries(formData);
  const phones = JSON.parse((raw.phones as string) || "[]");
  const tag_ids = JSON.parse((raw.tag_ids as string) || "[]");

  const parsed = customerSchema.safeParse({ ...raw, phones, tag_ids });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const {
    name,
    email,
    company,
    city,
    industry,
    source,
    status,
    primary_owner_id,
    marketing_opt_out,
  } = parsed.data;

  const { error } = await supabase
    .from("customers")
    .update({
      name,
      email: email || null,
      company: company || null,
      city: city || null,
      industry: industry || null,
      source: source || null,
      status,
      primary_owner_id: primary_owner_id ?? null,
      marketing_opt_out: marketing_opt_out ?? false,
    })
    .eq("id", id);

  if (error) return { error: { _root: [error.message] } };

  // Replace phones
  await supabase.from("customer_phones").delete().eq("customer_id", id);
  if (parsed.data.phones.length > 0) {
    await supabase.from("customer_phones").insert(
      parsed.data.phones.map((p, i) => ({
        customer_id: id,
        phone_number: p.phone_number,
        country_code: p.country_code,
        is_primary: i === 0 || p.is_primary,
      })),
    );
  }

  // Replace tags
  await supabase.from("customer_tags").delete().eq("customer_id", id);
  if (tag_ids.length > 0) {
    await supabase
      .from("customer_tags")
      .insert(tag_ids.map((tid: string) => ({ customer_id: id, tag_id: tid })));
  }

  await supabase.from("activities").insert({
    customer_id: id,
    user_id: profile.id,
    activity_type: "customer_updated",
    description: `Customer "${name}" updated`,
  });

  revalidatePath("/customers");
  revalidatePath(`/customers/${id}`);
  return { data: { id } };
}

// ─── Archive customer ─────────────────────────────────────────────
export async function archiveCustomer(id: string) {
  const supabase = await createClient();
  const profile = await getProfile(supabase);

  const { data: customer } = await supabase
    .from("customers")
    .select("name")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("customers")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: error.message };

  await supabase.from("activities").insert({
    customer_id: id,
    user_id: profile.id,
    activity_type: "customer_archived",
    description: `Customer "${customer?.name}" archived`,
  });

  revalidatePath("/customers");
  return { data: { id } };
}

// ─── Change status ────────────────────────────────────────────────
export async function changeCustomerStatus(
  id: string,
  newStatus: CustomerStatus,
) {
  const supabase = await createClient();
  const profile = await getProfile(supabase);

  const { data: customer } = await supabase
    .from("customers")
    .select("name, status")
    .eq("id", id)
    .single();

  if (!customer) return { error: "Customer not found" };

  const { error } = await supabase
    .from("customers")
    .update({ status: newStatus })
    .eq("id", id);

  if (error) return { error: error.message };

  // Status history
  await supabase.from("customer_status_history").insert({
    customer_id: id,
    from_status: customer.status,
    to_status: newStatus,
    changed_by: profile.id,
  });

  await supabase.from("activities").insert({
    customer_id: id,
    user_id: profile.id,
    activity_type: "status_changed",
    description: `Status changed from "${customer.status}" to "${newStatus}"`,
    metadata: { from: customer.status, to: newStatus },
  });

  revalidatePath(`/customers/${id}`);
  revalidatePath("/customers");
  return { data: { id } };
}

// ─── Get single customer ──────────────────────────────────────────
export async function fetchCustomer(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .select(
      `
      *,
      primary_owner:profiles!primary_owner_id(id, full_name),
      phones:customer_phones(id, phone_number, country_code, is_primary),
      tags:customer_tags(tag:tags(id, name))
    `,
    )
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

// ─── Fetch all tags ───────────────────────────────────────────────
export async function fetchTags() {
  const supabase = await createClient();
  const { data } = await supabase.from("tags").select("*").order("name");
  return data ?? [];
}

// ─── Create tag ───────────────────────────────────────────────────
export async function createTag(name: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tags")
    .insert({ name })
    .select()
    .single();
  if (error) return { error: error.message };
  revalidatePath("/settings/tags");
  return { data };
}

// ─── Fetch salespeople (for owner select) ────────────────────────
export async function fetchSalespeople() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("is_active", true)
    .order("full_name");
  return data ?? [];
}
