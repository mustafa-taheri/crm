import Link from "next/link";
import { fetchReportsOverview } from "@/lib/actions/reports";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Megaphone,
  TrendingUp,
  CalendarCheck,
  Users,
  ArrowRight,
} from "lucide-react";
import { CUSTOMER_STATUSES } from "@/lib/constants/ui";
import {
  CUSTOMER_STATUS_LABELS,
  customerStatusClass,
} from "@/lib/helpers/status";

export default async function ReportsOverviewPage() {
  const { stats, campaigns, pipeline, salespeople } =
    await fetchReportsOverview();

  const reportModules = [
    {
      title: "WhatsApp Campaigns Report",
      description:
        "Analyze broadcast delivery rates, read open rates, and direct reply conversions.",
      icon: Megaphone,
      href: "/reports/campaigns",
      stat: `${campaigns.length} Total Campaigns`,
    },
    {
      title: "Customer Status & Pipeline",
      description:
        "Track lead velocity, historical status changes, and pipeline distribution.",
      icon: TrendingUp,
      href: "/reports/customer-status",
      stat: `${stats.total_customers} Total Customers`,
    },
    {
      title: "Follow-up Tasks Summary",
      description:
        "Review pending, completed, and overdue follow-up performance across sales reps.",
      icon: CalendarCheck,
      href: "/reports/follow-ups",
      stat: `${stats.followups_today} Today • ${stats.overdue_followups} Overdue`,
    },
    {
      title: "Salesperson Activity Report",
      description:
        "Monitor customer ownership, activity logs, and follow-up completion rates.",
      icon: Users,
      href: "/reports/salesperson",
      stat: `${salespeople.length} Active Team Members`,
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          CRM Reports & Analytics
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Comprehensive historical reports, campaign performance, and team
          activity.
        </p>
      </div>

      {/* Report Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportModules.map((mod, idx) => (
          <Link key={idx} href={mod.href} className="block group">
            <Card className="h-full transition-all hover:shadow-md hover:border-primary/40">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-lg bg-primary-50 text-primary">
                    <mod.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded bg-muted text-foreground">
                    {mod.stat}
                  </span>
                </div>
                <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors mt-3">
                  {mod.title}
                </CardTitle>
                <CardDescription>{mod.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs group-hover:text-primary"
                >
                  View Report <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
