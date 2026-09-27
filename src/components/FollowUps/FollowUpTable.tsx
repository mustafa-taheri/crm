"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { PRIORITY_LABELS, PRIORITY_COLORS } from "@/lib/helpers/status";
import { formatTime, formatDateTime, isOverdue } from "@/lib/helpers/format";
import { completeFollowup, reopenFollowup } from "@/lib/actions/followups";
import {
  CheckCircle2,
  RotateCcw,
  CalendarCheck,
  Clock,
  User,
} from "lucide-react";
import type { Database } from "@/types/supabase";

type FollowupPriority = Database["public"]["Enums"]["followup_priority"];

export interface FollowupRow {
  id: string;
  description: string;
  due_date: string;
  due_time: string | null;
  priority: FollowupPriority;
  status: "pending" | "completed";
  completed_at: string | null;
  customer?: { id: string; name: string; company: string | null } | null;
  assigned_user?: { id: string; full_name: string } | null;
}

interface FollowUpTableProps {
  followups: FollowupRow[];
  filter: string;
}

export function FollowUpTable({ followups, filter }: FollowUpTableProps) {
  const router = useRouter();
  const [actingId, setActingId] = React.useState<string | null>(null);

  const handleToggleComplete = async (id: string, currentStatus: string) => {
    setActingId(id);
    try {
      if (currentStatus === "pending") {
        await completeFollowup(id);
      } else {
        await reopenFollowup(id);
      }
      router.refresh();
    } finally {
      setActingId(null);
    }
  };

  if (followups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center bg-card">
        <CalendarCheck className="h-10 w-10 text-muted-foreground mb-3 opacity-50" />
        <h3 className="text-base font-semibold">No follow-ups found</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {filter === "today"
            ? "No tasks due today. Great job!"
            : filter === "overdue"
              ? "No overdue tasks. All up to date!"
              : "No follow-ups match this filter."}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">Status</TableHead>
            <TableHead className="w-[240px]">Customer</TableHead>
            <TableHead>Task / Description</TableHead>
            <TableHead>Due Date & Time</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {followups.map((f) => {
            const overdue = isOverdue(f.due_date, f.due_time, f.status);

            return (
              <TableRow key={f.id} className="group">
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleComplete(f.id, f.status)}
                    disabled={actingId === f.id}
                    className={`h-7 w-7 ${
                      f.status === "completed"
                        ? "text-success hover:text-success/80"
                        : overdue
                          ? "text-error hover:text-success"
                          : "text-muted-foreground hover:text-success"
                    }`}
                    title={
                      f.status === "completed"
                        ? "Click to Reopen"
                        : "Click to Mark Completed"
                    }
                  >
                    {f.status === "completed" ? (
                      <CheckCircle2 className="h-4 w-4 fill-success/20" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-current" />
                    )}
                  </Button>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/customers/${f.customer?.id}`}
                    className="font-semibold text-xs text-foreground hover:text-primary transition-colors block"
                  >
                    {f.customer?.name}
                  </Link>
                  {f.customer?.company && (
                    <span className="text-[11px] text-muted-foreground">
                      {f.customer.company}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <span
                    className={`text-sm ${
                      f.status === "completed"
                        ? "line-through text-muted-foreground"
                        : "font-medium text-foreground"
                    }`}
                  >
                    {f.description}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="text-xs space-y-0.5">
                    <span
                      className={`font-semibold block ${
                        overdue ? "text-error" : "text-foreground"
                      }`}
                    >
                      {f.due_date}
                    </span>
                    <span className="text-muted-foreground text-[11px] font-mono">
                      {formatTime(f.due_time) || "Anytime"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                      PRIORITY_COLORS[f.priority]
                    }`}
                  >
                    {PRIORITY_LABELS[f.priority]}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-medium text-foreground">
                    {f.assigned_user?.full_name || (
                      <span className="text-muted-foreground italic">
                        Unassigned
                      </span>
                    )}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {f.status === "completed" ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleComplete(f.id, f.status)}
                        disabled={actingId === f.id}
                        className="h-7 text-xs text-muted-foreground"
                      >
                        <RotateCcw className="mr-1 h-3 w-3" />
                        Reopen
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleComplete(f.id, f.status)}
                        disabled={actingId === f.id}
                        className="h-7 text-xs text-success hover:bg-success/10 border-success/30"
                      >
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Done
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
