import Link from "next/link";
import { fetchDashboardData } from "@/lib/actions/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  MessageSquare,
  Megaphone,
  AlertCircle,
  CalendarCheck,
  Clock,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { CUSTOMER_STATUSES } from "@/lib/constants/ui";
import {
  CUSTOMER_STATUS_LABELS,
  customerStatusClass,
} from "@/lib/helpers/status";
import { formatTime, formatRelativeTime } from "@/lib/helpers/format";

export default async function DashboardPage() {
  const {
    profile,
    isAdmin,
    stats,
    pipelineCounts,
    recentConversations,
    todayFollowups,
  } = await fetchDashboardData();

  const statCards = [
    {
      title: "Total Customers",
      value: stats.total_customers,
      subtitle: isAdmin ? "All active accounts" : "Assigned to you",
      icon: Users,
      href: "/customers",
      color: "text-primary",
      bg: "bg-primary-50",
    },
    {
      title: "Active Chats",
      value: stats.active_chats,
      subtitle: "Open WhatsApp threads",
      icon: MessageSquare,
      href: "/whatsapp/inbox",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Unread Messages",
      value: stats.unread_replies,
      subtitle: "Requires attention",
      icon: AlertCircle,
      href: "/whatsapp/inbox",
      color: stats.unread_replies > 0 ? "text-error" : "text-muted-foreground",
      bg: stats.unread_replies > 0 ? "bg-error-light" : "bg-muted",
    },
    {
      title: "Follow-ups Today",
      value: stats.followups_today,
      subtitle: "Scheduled for today",
      icon: CalendarCheck,
      href: "/follow-ups",
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Overdue Tasks",
      value: stats.overdue_followups,
      subtitle: "Pending past due",
      icon: Clock,
      href: "/follow-ups",
      color:
        stats.overdue_followups > 0 ? "text-error" : "text-muted-foreground",
      bg: stats.overdue_followups > 0 ? "bg-error-light" : "bg-muted",
    },
    ...(isAdmin
      ? [
          {
            title: "Active Campaigns",
            value: stats.active_campaigns,
            subtitle: "Running / Scheduled",
            icon: Megaphone,
            href: "/whatsapp/campaigns",
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
        ]
      : []),
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome back, {profile?.full_name}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isAdmin
              ? "Administrator Overview • Company-wide metrics and pipeline status."
              : "Sales Workspace • Your assigned leads, follow-ups, and active chats."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/customers/add">
            <Button size="sm">Add Customer</Button>
          </Link>
          <Link href="/whatsapp/inbox">
            <Button variant="outline" size="sm">
              Open Inbox
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((card, idx) => (
          <Link key={idx} href={card.href} className="block group">
            <Card className="transition-all hover:shadow-md hover:border-primary/40 h-full">
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {card.title}
                  </span>
                  <div className={`p-2 rounded-md ${card.bg}`}>
                    <card.icon className={`h-4 w-4 ${card.color}`} />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold tracking-tight text-foreground">
                    {card.value}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {card.subtitle}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Sales Pipeline Funnel Cards */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Sales Pipeline Breakdown
          </CardTitle>
          <Link
            href="/customers"
            className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
          >
            View all customers <ArrowRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-2">
            {CUSTOMER_STATUSES.map((status) => {
              const count = pipelineCounts[status] || 0;
              return (
                <Link
                  key={status}
                  href={`/customers?status=${status}`}
                  className="rounded-lg border p-3 text-center transition-all hover:border-primary/40 hover:bg-muted/30"
                >
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold mb-2 ${customerStatusClass(
                      status,
                    )}`}
                  >
                    {CUSTOMER_STATUS_LABELS[status]}
                  </span>
                  <p className="text-xl font-bold text-foreground">{count}</p>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Two Column Grid: Today's Follow-ups & Recent Conversations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Follow-ups */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-primary" />
              Today&apos;s Follow-ups ({todayFollowups.length})
            </CardTitle>
            <Link
              href="/follow-ups"
              className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {todayFollowups.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No follow-ups due today. You&apos;re all caught up!
              </div>
            ) : (
              <div className="divide-y">
                {todayFollowups.map((f) => (
                  <div
                    key={f.id}
                    className="py-3 flex items-start justify-between gap-3 group"
                  >
                    <div className="space-y-1">
                      <Link
                        href={`/customers/${f.customer?.id}`}
                        className="font-semibold text-sm hover:text-primary transition-colors block"
                      >
                        {f.customer?.name}
                        {f.customer?.company && (
                          <span className="text-xs text-muted-foreground font-normal ml-1.5">
                            ({f.customer.company})
                          </span>
                        )}
                      </Link>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {f.description}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-medium block">
                        {formatTime(f.due_time) || "Anytime"}
                      </span>
                      <span
                        className={`inline-block px-1.5 py-0.2 rounded text-[10px] uppercase font-bold ${
                          f.priority === "high"
                            ? "text-error"
                            : f.priority === "medium"
                              ? "text-amber-600"
                              : "text-muted-foreground"
                        }`}
                      >
                        {f.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Active Conversations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              Active Conversations
            </CardTitle>
            <Link
              href="/whatsapp/inbox"
              className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
            >
              Open Inbox <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentConversations.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No active conversations yet.
              </div>
            ) : (
              <div className="divide-y">
                {recentConversations.map((c) => (
                  <Link
                    key={c.id}
                    href={`/whatsapp/inbox?conversationId=${c.id}`}
                    className="py-3 flex items-center justify-between gap-3 group hover:bg-muted/40 px-2 rounded-md transition-colors block"
                  >
                    <div className="space-y-0.5">
                      <p className="font-semibold text-sm group-hover:text-primary transition-colors">
                        {c.customer?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {c.customer?.company || "Individual Customer"}
                      </p>
                    </div>

                    <div className="text-right shrink-0 flex items-center gap-2">
                      {c.unread_count > 0 && (
                        <Badge
                          variant="destructive"
                          className="h-5 px-1.5 text-[10px]"
                        >
                          {c.unread_count} unread
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {c.last_message_at
                          ? formatRelativeTime(c.last_message_at)
                          : ""}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
