"use server";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

type CustomerStatus = Database["public"]["Enums"]["customer_status"];

export async function fetchDashboardData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("user_id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";
  const today = new Date().toISOString().split("T")[0];

  // 1. Overall or Salesperson Stats
  let stats = {
    total_customers: 0,
    active_chats: 0,
    active_campaigns: 0,
    unread_replies: 0,
    followups_today: 0,
    overdue_followups: 0,
  };

  if (isAdmin) {
    const { data: statsView } = await supabase
      .from("dashboard_stats")
      .select("*")
      .single();
    if (statsView) stats = statsView;
  } else if (profile) {
    // Salesperson-specific stats
    const [
      { count: myCustomers },
      { count: myChats },
      { count: myUnread },
      { count: myFollowupsToday },
      { count: myFollowupsOverdue },
    ] = await Promise.all([
      supabase
        .from("customers")
        .select("*", { count: "exact", head: true })
        .eq("primary_owner_id", profile.id)
        .is("archived_at", null),
      supabase
        .from("conversations")
        .select("*", { count: "exact", head: true })
        .eq("assigned_user_id", profile.id)
        .eq("state", "open"),
      supabase
        .from("conversations")
        .select("*", { count: "exact", head: true })
        .eq("assigned_user_id", profile.id)
        .eq("state", "open")
        .gt("unread_count", 0),
      supabase
        .from("followups")
        .select("*", { count: "exact", head: true })
        .eq("assigned_user_id", profile.id)
        .eq("status", "pending")
        .eq("due_date", today),
      supabase
        .from("followups")
        .select("*", { count: "exact", head: true })
        .eq("assigned_user_id", profile.id)
        .eq("status", "pending")
        .lt("due_date", today),
    ]);

    stats = {
      total_customers: myCustomers ?? 0,
      active_chats: myChats ?? 0,
      active_campaigns: 0,
      unread_replies: myUnread ?? 0,
      followups_today: myFollowupsToday ?? 0,
      overdue_followups: myFollowupsOverdue ?? 0,
    };
  }

  // 2. Pipeline Counts
  let pipelineQuery = supabase
    .from("customers")
    .select("status")
    .is("archived_at", null);
  if (!isAdmin && profile) {
    pipelineQuery = pipelineQuery.eq("primary_owner_id", profile.id);
  }
  const { data: customerStatuses } = await pipelineQuery;
  const pipelineCounts: Record<CustomerStatus, number> = {
    new_reply: 0,
    interested: 0,
    quotation: 0,
    negotiation: 0,
    won: 0,
    lost: 0,
  };
  for (const c of customerStatuses ?? []) {
    if (pipelineCounts[c.status] !== undefined) {
      pipelineCounts[c.status]++;
    }
  }

  // 3. Recent Conversations
  let convQuery = supabase
    .from("conversations")
    .select(
      `
      id,
      state,
      unread_count,
      last_message_at,
      customer:customers(id, name, company),
      assigned_user:profiles(id, full_name)
    `,
    )
    .eq("state", "open")
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .limit(5);

  if (!isAdmin && profile) {
    convQuery = convQuery.eq("assigned_user_id", profile.id);
  }
  const { data: recentConversations } = await convQuery;

  // 4. Today's Follow-ups
  let followupQuery = supabase
    .from("followups")
    .select(
      `
      id,
      description,
      due_date,
      due_time,
      priority,
      status,
      customer:customers(id, name, company),
      assigned_user:profiles(id, full_name)
    `,
    )
    .eq("status", "pending")
    .eq("due_date", today)
    .order("due_time", { ascending: true, nullsFirst: false })
    .limit(5);

  if (!isAdmin && profile) {
    followupQuery = followupQuery.eq("assigned_user_id", profile.id);
  }
  const { data: todayFollowups } = await followupQuery;

  return {
    profile,
    isAdmin,
    stats,
    pipelineCounts,
    recentConversations: recentConversations ?? [],
    todayFollowups: todayFollowups ?? [],
  };
}
