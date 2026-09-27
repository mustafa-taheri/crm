"use server";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

export async function fetchReportsOverview() {
  const supabase = await createClient();

  const [
    { data: stats },
    { data: campaigns },
    { data: pipeline },
    { data: salespeople },
  ] = await Promise.all([
    supabase.from("dashboard_stats").select("*").single(),
    supabase.from("campaign_analytics").select("*"),
    supabase.from("pipeline_counts").select("*"),
    supabase
      .from("profiles")
      .select("id, full_name, role")
      .eq("is_active", true),
  ]);

  return {
    stats: stats || {
      total_customers: 0,
      active_chats: 0,
      active_campaigns: 0,
      unread_replies: 0,
      followups_today: 0,
      overdue_followups: 0,
    },
    campaigns: campaigns ?? [],
    pipeline: pipeline ?? [],
    salespeople: salespeople ?? [],
  };
}

export async function fetchCampaignReport() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("campaign_analytics")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function fetchCustomerStatusReport() {
  const supabase = await createClient();

  const [{ data: pipeline }, { data: statusHistory }] = await Promise.all([
    supabase.from("pipeline_counts").select("*"),
    supabase
      .from("customer_status_history")
      .select(
        `
        id,
        from_status,
        to_status,
        changed_at,
        customer:customers(id, name, company),
        changer:profiles!changed_by(id, full_name)
      `,
      )
      .order("changed_at", { ascending: false })
      .limit(100),
  ]);

  return {
    pipeline: pipeline ?? [],
    history: statusHistory ?? [],
  };
}

export async function fetchFollowupReport() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: followups } = await supabase.from("followups").select(`
      id,
      description,
      due_date,
      due_time,
      priority,
      status,
      completed_at,
      customer:customers(name),
      assigned_user:profiles!assigned_user_id(id, full_name)
    `);

  const all = followups ?? [];
  const total = all.length;
  const completed = all.filter((f) => f.status === "completed").length;
  const pending = all.filter((f) => f.status === "pending").length;
  const overdue = all.filter(
    (f) => f.status === "pending" && f.due_date < today,
  ).length;

  // Breakdown by salesperson
  const byUserMap: Record<
    string,
    {
      name: string;
      total: number;
      completed: number;
      pending: number;
      overdue: number;
    }
  > = {};

  for (const f of all) {
    const uId = f.assigned_user?.id || "unassigned";
    const uName = f.assigned_user?.full_name || "Unassigned";

    if (!byUserMap[uId]) {
      byUserMap[uId] = {
        name: uName,
        total: 0,
        completed: 0,
        pending: 0,
        overdue: 0,
      };
    }

    byUserMap[uId].total++;
    if (f.status === "completed") byUserMap[uId].completed++;
    if (f.status === "pending") {
      byUserMap[uId].pending++;
      if (f.due_date < today) byUserMap[uId].overdue++;
    }
  }

  return {
    summary: { total, completed, pending, overdue },
    salespeopleBreakdown: Object.values(byUserMap),
  };
}

export async function fetchSalespersonActivityReport() {
  const supabase = await createClient();

  const { data: salespeople } = await supabase
    .from("profiles")
    .select(
      `
      id,
      full_name,
      role,
      customers:customers!primary_owner_id(id),
      followups:followups!assigned_user_id(id, status),
      activities:activities!user_id(id, activity_type, created_at)
    `,
    )
    .eq("is_active", true);

  const rows = (salespeople ?? []).map((sp) => {
    const custCount = sp.customers?.length || 0;
    const fuTotal = sp.followups?.length || 0;
    const fuCompleted =
      sp.followups?.filter((f: any) => f.status === "completed").length || 0;
    const actTotal = sp.activities?.length || 0;

    return {
      id: sp.id,
      name: sp.full_name,
      role: sp.role,
      customersCount: custCount,
      followupsTotal: fuTotal,
      followupsCompleted: fuCompleted,
      activitiesLogged: actTotal,
    };
  });

  return rows;
}
