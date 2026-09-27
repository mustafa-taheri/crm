import Link from "next/link";
import { fetchSalespersonActivityReport } from "@/lib/actions/reports";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Activity, CheckCircle2 } from "lucide-react";

export default async function SalespersonReportPage() {
  const rows = await fetchSalespersonActivityReport();

  const exportRows = rows.map((r) => ({
    "Sales Rep Name": r.name,
    Role: r.role,
    "Assigned Customers": r.customersCount,
    "Total Follow-ups": r.followupsTotal,
    "Completed Follow-ups": r.followupsCompleted,
    "Logged Activities": r.activitiesLogged,
  }));

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
              <Users className="h-6 w-6 text-primary" />
              Salesperson Activity & Workload Report
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Account distribution, follow-up execution, and overall CRM
              productivity.
            </p>
          </div>
        </div>

        <ExportButton
          data={exportRows}
          filename="salesperson_activity_report"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sales Rep</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Assigned Accounts</TableHead>
                <TableHead>Tasks Completed / Total</TableHead>
                <TableHead>Total Activities Logged</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground text-sm"
                  >
                    No active team members found.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-semibold text-xs text-foreground">
                      {r.name}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="text-[10px] capitalize"
                      >
                        {r.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-mono font-medium">
                      {r.customersCount} customers
                    </TableCell>
                    <TableCell className="text-xs font-mono">
                      <span className="text-success font-semibold">
                        {r.followupsCompleted}
                      </span>{" "}
                      /{" "}
                      <span className="text-muted-foreground">
                        {r.followupsTotal}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-mono font-medium text-primary">
                      {r.activitiesLogged} actions
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
