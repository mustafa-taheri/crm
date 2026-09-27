"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { createFollowup } from "@/lib/actions/followups";
import { Plus, Calendar, Clock } from "lucide-react";

interface CreateFollowUpFormProps {
  customers: { id: string; name: string; company: string | null }[];
  salespeople: { id: string; full_name: string }[];
  preselectedCustomerId?: string;
}

export function CreateFollowUpForm({
  customers,
  salespeople,
  preselectedCustomerId,
}: CreateFollowUpFormProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(!!preselectedCustomerId);
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const [customerId, setCustomerId] = React.useState(
    preselectedCustomerId || "",
  );
  const [description, setDescription] = React.useState("");
  const [dueDate, setDueDate] = React.useState(
    new Date().toISOString().split("T")[0],
  );
  const [dueTime, setDueTime] = React.useState("11:00");
  const [priority, setPriority] = React.useState<"low" | "medium" | "high">(
    "medium",
  );
  const [assignedUserId, setAssignedUserId] = React.useState<string>("none");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !description.trim() || !dueDate) {
      setErrorMsg("Please select a customer, task description, and due date.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append("customer_id", customerId);
    formData.append("description", description.trim());
    formData.append("due_date", dueDate);
    if (dueTime) formData.append("due_time", dueTime);
    formData.append("priority", priority);
    if (assignedUserId && assignedUserId !== "none") {
      formData.append("assigned_user_id", assignedUserId);
    }

    try {
      const res = await createFollowup(formData);
      if (res.error) {
        setErrorMsg(
          typeof res.error === "object"
            ? Object.values(res.error).flat().join(", ")
            : "Failed to create follow-up",
        );
      } else {
        setDescription("");
        if (!preselectedCustomerId) setIsOpen(false);
        router.refresh();
      }
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || "Failed to schedule task");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} size="sm">
        <Plus className="mr-1.5 h-4 w-4" />
        Schedule Follow-up
      </Button>
    );
  }

  return (
    <Card className="border-primary/30 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Schedule New Follow-up</CardTitle>
        <CardDescription>
          Set reminders for customer quotes, meetings, or sample deliveries.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded bg-error/10 text-error text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="fu-customer">Select Customer *</Label>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger id="fu-customer">
                  <SelectValue placeholder="Choose customer" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} {c.company ? `(${c.company})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="fu-desc">Task / Reminder Note *</Label>
              <Textarea
                id="fu-desc"
                placeholder="e.g. Call regarding quotation #402, verify customized branding mockups..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fu-date">Due Date *</Label>
              <Input
                id="fu-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fu-time">Due Time</Label>
              <Input
                id="fu-time"
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fu-priority">Priority</Label>
              <Select
                value={priority}
                onValueChange={(val: any) => setPriority(val)}
              >
                <SelectTrigger id="fu-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fu-assign">Assigned To</Label>
              <Select value={assignedUserId} onValueChange={setAssignedUserId}>
                <SelectTrigger id="fu-assign">
                  <SelectValue placeholder="Myself" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Myself (Logged in user)</SelectItem>
                  {salespeople.map((sp) => (
                    <SelectItem key={sp.id} value={sp.id}>
                      {sp.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t">
            {!preselectedCustomerId && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? "Scheduling..." : "Schedule Task"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
