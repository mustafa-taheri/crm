import Link from "next/link";
import { FollowUpTable } from "@/components/FollowUps/FollowUpTable";
import { CreateFollowUpForm } from "@/components/FollowUps/CreateFollowUpForm";
import { fetchFollowups } from "@/lib/actions/followups";
import { fetchCustomers, fetchSalespeople } from "@/lib/actions/customers";
import { CalendarCheck } from "lucide-react";

interface FollowupsPageProps {
  searchParams: Promise<{
    filter?: "all" | "today" | "upcoming" | "overdue" | "completed";
    customerId?: string;
  }>;
}

export default async function FollowupsPage({
  searchParams,
}: FollowupsPageProps) {
  const params = await searchParams;
  const activeFilter = params.filter || "all";

  const [followups, { data: customers }, salespeople] = await Promise.all([
    fetchFollowups(activeFilter),
    fetchCustomers({ per_page: 200 }),
    fetchSalespeople(),
  ]);

  const filters = [
    { label: "All", value: "all" },
    { label: "Today", value: "today" },
    { label: "Upcoming", value: "upcoming" },
    { label: "Overdue", value: "overdue" },
    { label: "Completed", value: "completed" },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CalendarCheck className="h-6 w-6 text-primary" />
            Follow-up Tasks
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your customer follow-up schedule and pending reminders.
          </p>
        </div>

        <CreateFollowUpForm
          customers={customers as any}
          salespeople={salespeople}
          preselectedCustomerId={params.customerId}
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b pb-2">
        {filters.map((f) => (
          <Link
            key={f.value}
            href={`/follow-ups?filter=${f.value}`}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              activeFilter === f.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {/* Table */}
      <FollowUpTable followups={followups as any} filter={activeFilter} />
    </div>
  );
}
