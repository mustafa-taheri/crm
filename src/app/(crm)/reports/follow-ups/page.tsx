import Link from "next/link";
import { fetchFollowupReport } from "@/lib/actions/reports";
import { ExportButton } from "@/components/Reports/ExportButton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CalendarCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";

export default async function FollowupReportPage() {
  const { summary, salespeopleBreakdown } = await fetchFollowupReport();

  const exportRows = salespeopleBreakdown.map((s) => ({
    "Sales Rep": s.name,
    "Total Assigned": s.total,
    "Completed Tasks": s.completed,
    "Pending Tasks": s.pending,
    "Overdue Tasks": s.overdue,
    "Completion Rate":
      s.total > 0 ? `${Math.round((s.completed / s.total) * 100)}%` : "0%",
  }));

  const completionRate =
    summary.total > 0
      ? Math.round((summary.completed / summary.total) * 100)
      : 0;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/reports">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <CalendarCheck className="h-6 w-6 text-primary" />
              Follow-up Performance Report
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Task completion analytics, pending workload, and overdue tracking.
            </p>
          </div>
        </div>

        <ExportButton data={exportRows} filename="followup_report" />
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5">
          <span className="text-xs text-muted-foreground font-semibold">
            Total Follow-ups
          </span>
          <p className="text-3xl font-bold mt-2 text-foreground">
            {summary.total}
          </p>
        </Card>

        <Card className="p-5">
          <span className="text-xs text-muted-foreground font-semibold">
            Completed
          </span>
          <p className="text-3xl font-bold mt-2 text-success">
            {summary.completed}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {completionRate}% overall completion rate
          </p>
        </Card>

        <Card className="p-5">
          <span className="text-xs text-muted-foreground font-semibold">
            Pending
          </span>
          <p className="text-3xl font-bold mt-2 text-amber-600">
            {summary.pending}
          </p>
        </Card>

        <Card className="p-5">
          <span className="text-xs text-muted-foreground font-semibold">
            Overdue
          </span>
          <p className="text-3xl font-bold mt-2 text-error">
            {summary.overdue}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Requires immediate follow-up
          </p>
        </Card>
      </div>

      {/* Breakdown by Sales Rep Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Breakdown by Sales Representative
          </CardTitle>
          <CardDescription>
            Individual task workload and completion efficiency.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sales Rep</TableHead>
                <TableHead>Total Tasks</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Pending</TableHead>
                <TableHead>Overdue</TableHead>
                <TableHead>Completion Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salespeopleBreakdown.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground text-sm"
                  >
                    No follow-up data available.
                  </TableCell>
                </TableRow>
              ) : (
                salespeopleBreakdown.map((s, idx) => {
                  const rate =
                    s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0;

                  return (
                    <TableRow key={idx}>
                      <TableCell className="font-semibold text-xs text-foreground">
                        {s.name}
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        {s.total}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-success font-medium">
                        {s.completed}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-amber-600 font-medium">
                        {s.pending}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-error font-bold">
                        {s.overdue}
                      </TableCell>
                      <TableCell className="text-xs font-mono font-semibold">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-20 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${rate}%` }}
                            />
                          </div>
                          <span>{rate}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
