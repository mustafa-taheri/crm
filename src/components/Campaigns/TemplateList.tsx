"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { updateTemplateStatus } from "@/lib/actions/campaigns";
import { useUser } from "@/lib/hooks/useUser";
import { CheckCircle2, XCircle, Clock, FileText } from "lucide-react";
import { formatDateTime } from "@/lib/helpers/format";

interface TemplateItem {
  id: string;
  name: string;
  content: string;
  status: "draft" | "pending" | "approved" | "rejected";
  created_at: string;
  creator?: { full_name: string } | null;
  approver?: { full_name: string } | null;
}

export function TemplateList({ templates }: { templates: TemplateItem[] }) {
  const router = useRouter();
  const { role } = useUser();
  const isAdmin = role === "admin";
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);

  const handleStatus = async (id: string, status: "approved" | "rejected") => {
    setUpdatingId(id);
    try {
      await updateTemplateStatus(id, status);
      router.refresh();
    } finally {
      setUpdatingId(null);
    }
  };

  if (templates.length === 0) {
    return (
      <div className="text-center py-12 text-sm text-muted-foreground border rounded-lg bg-card">
        No WhatsApp templates created yet. Create a template using the form
        above.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {templates.map((tpl) => (
        <Card key={tpl.id} className="flex flex-col justify-between">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-base font-semibold">
                {tpl.name}
              </CardTitle>
              <Badge
                variant={
                  tpl.status === "approved"
                    ? "success"
                    : tpl.status === "pending"
                      ? "warning"
                      : tpl.status === "rejected"
                        ? "destructive"
                        : "outline"
                }
                className="capitalize text-xs"
              >
                {tpl.status}
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Created by {tpl.creator?.full_name || "Team member"} •{" "}
              {formatDateTime(tpl.created_at)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-md bg-muted text-xs font-mono whitespace-pre-wrap max-h-36 overflow-y-auto">
              {tpl.content}
            </div>

            {isAdmin && tpl.status === "pending" && (
              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatus(tpl.id, "rejected")}
                  disabled={updatingId === tpl.id}
                  className="h-8 text-xs text-error hover:bg-error/10"
                >
                  <XCircle className="mr-1 h-3.5 w-3.5" />
                  Reject
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleStatus(tpl.id, "approved")}
                  disabled={updatingId === tpl.id}
                  className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                  Approve Template
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
