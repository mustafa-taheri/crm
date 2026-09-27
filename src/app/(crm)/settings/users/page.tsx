import { fetchUsers } from "@/lib/actions/users";
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
import { UserManagementTable } from "@/components/Settings/UserManagementTable";
import { Users, Shield } from "lucide-react";

export default async function UserSettingsPage() {
  const users = await fetchUsers();

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          Team Members & Role Permissions
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage CRM staff accounts, assign Administrator or Salesperson roles,
          and active status.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Active User Directory
          </CardTitle>
          <CardDescription>
            Admin users have full system access including approvals and user
            management. Salespeople manage their assigned accounts and inbox.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <UserManagementTable users={users as any} />
        </CardContent>
      </Card>
    </div>
  );
}
