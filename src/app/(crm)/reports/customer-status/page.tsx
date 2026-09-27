import Link from "next/link";
import { fetchCustomerStatusReport } from "@/lib/actions/reports";
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
import { ArrowLeft, TrendingUp, History } from "lucide-react";
import { CUSTOMER_STATUSES } from "@/lib/constants/ui";
import {
  CUSTOMER_STATUS_LABELS,
  customerStatusClass,
} from "@/lib/helpers/status";
import { formatDateTime } from "@/lib/helpers/format";

export default async function CustomerStatusReportPage() {
  const { pipeline, history } = await fetchCustomerStatusReport();

  const exportRows = history.map((h) => ({
    Customer: h.customer?.name || "Unknown",
    Company: h.customer?.company || "",
    "Previous Status": h.from_status
      ? CUSTOMER_STATUS_LABELS[
          h.from_status as keyof typeof CUSTOMER_STATUS_LABELS
        ] || h.from_status
      : "Initial",
    "New Status":
      CUSTOMER_STATUS_LABELS[
        h.to_status as keyof typeof CUSTOMER_STATUS_LABELS
      ] || h.to_status,
    "Changed By": h.changer?.full_name || "System",
    "Timestamp (IST)": formatDateTime(h.changed_at),
  }));

  const pipelineMap: Record<string, number> = {};
  for (const p of pipeline) {
    pipelineMap[p.status] = p.count;
  }

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
              <TrendingUp className="h-6 w-6 text-primary" />
              Customer Status & Pipeline Report
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Sales pipeline distribution and historical lead status
              progression.
            </p>
          </div>
        </div>

        <ExportButton
          data={exportRows}
          filename="customer_status_history"
          label="Export History CSV"
        />
      </div>

      {/* Pipeline Snapshot Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {CUSTOMER_STATUSES.map((status) => {
          const count = pipelineMap[status] || 0;
          return (
            <Card key={status} className="p-4 text-center">
              <span
                className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold mb-2 ${customerStatusClass(
                  status,
                )}`}
              >
                {CUSTOMER_STATUS_LABELS[status]}
              </span>
              <p className="text-2xl font-bold text-foreground">{count}</p>
            </Card>
          );
        })}
      </div>

      {/* Historical Status Changes Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            Recent Status Transition Log
          </CardTitle>
          <CardDescription>
            Chronological log of customer progression through sales pipeline
            stages.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Previous Stage</TableHead>
                <TableHead>Updated Stage</TableHead>
                <TableHead>Changed By</TableHead>
                <TableHead>Date & Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground text-sm"
                  >
                    No status change history recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                history.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell>
                      <Link
                        href={`/customers/${h.customer?.id}`}
                        className="font-semibold text-xs text-foreground hover:text-primary transition-colors block"
                      >
                        {h.customer?.name}
                      </Link>
                      {h.customer?.company && (
                        <span className="text-[11px] text-muted-foreground">
                          {h.customer.company}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {h.from_status ? (
                        <span
                          className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold ${customerStatusClass(
                            h.from_status,
                          )}`}
                        >
                          {CUSTOMER_STATUS_LABELS[h.from_status] ||
                            h.from_status}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Initial Lead
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold ${customerStatusClass(
                          h.to_status,
                        )}`}
                      >
                        {CUSTOMER_STATUS_LABELS[h.to_status] || h.to_status}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-medium text-foreground">
                      {h.changer?.full_name || "Sales Rep"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDateTime(h.changed_at)}
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
