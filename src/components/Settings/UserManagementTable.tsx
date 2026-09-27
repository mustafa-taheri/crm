"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { updateUserRole, toggleUserActive } from "@/lib/actions/users";
import { formatDateTime } from "@/lib/helpers/format";
import { Shield, ShieldAlert, Check, Ban } from "lucide-react";

interface ProfileRow {
  id: string;
  user_id: string;
  full_name: string;
  role: "admin" | "salesperson";
  is_active: boolean;
  created_at: string;
}

export function UserManagementTable({ users }: { users: ProfileRow[] }) {
  const router = useRouter();
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);

  const handleRoleChange = async (
    id: string,
    role: "admin" | "salesperson",
  ) => {
    setUpdatingId(id);
    try {
      await updateUserRole(id, role);
      router.refresh();
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    setUpdatingId(id);
    try {
      await toggleUserActive(id, !current);
      router.refresh();
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Staff Member</TableHead>
          <TableHead>Assigned Role</TableHead>
          <TableHead>Account Status</TableHead>
          <TableHead>Joined Date</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((u) => (
          <TableRow key={u.id}>
            <TableCell className="font-semibold text-xs text-foreground">
              {u.full_name}
            </TableCell>
            <TableCell>
              <div className="w-36">
                <Select
                  value={u.role}
                  onValueChange={(r: any) => handleRoleChange(u.id, r)}
                  disabled={updatingId === u.id}
                >
                  <SelectTrigger className="h-8 text-xs font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="salesperson">Salesperson</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TableCell>
            <TableCell>
              <Badge
                variant={u.is_active ? "success" : "outline"}
                className="text-[10px] capitalize"
              >
                {u.is_active ? "Active" : "Deactivated"}
              </Badge>
            </TableCell>
            <TableCell className="text-xs text-muted-foreground">
              {formatDateTime(u.created_at)}
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleToggleActive(u.id, u.is_active)}
                disabled={updatingId === u.id}
                className={`h-7 text-xs ${
                  u.is_active
                    ? "text-error hover:bg-error/10"
                    : "text-success hover:bg-success/10"
                }`}
              >
                {u.is_active ? (
                  <>
                    <Ban className="mr-1 h-3 w-3" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <Check className="mr-1 h-3 w-3" />
                    Activate
                  </>
                )}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
