"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CUSTOMER_STATUSES } from "@/lib/constants/ui";
import { CUSTOMER_STATUS_LABELS } from "@/lib/helpers/status";
import { RotateCcw } from "lucide-react";

interface CustomerFiltersProps {
  tags?: { id: string; name: string }[];
  salespeople?: { id: string; full_name: string }[];
}

export function CustomerFilters({
  tags = [],
  salespeople = [],
}: CustomerFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get("status") || "all";
  const currentTag = searchParams.get("tag_id") || "all";
  const currentOwner = searchParams.get("owner_id") || "all";
  const currentArchived = searchParams.get("archived") === "true";

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    router.push(`/customers?${params.toString()}`);
  };

  const resetFilters = () => {
    router.push("/customers");
  };

  const hasActiveFilters =
    searchParams.has("status") ||
    searchParams.has("tag_id") ||
    searchParams.has("owner_id") ||
    searchParams.has("search") ||
    searchParams.has("archived");

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Status Filter */}
      <div className="w-40">
        <Select
          value={currentStatus}
          onValueChange={(val) => updateParam("status", val)}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {CUSTOMER_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {CUSTOMER_STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tag Filter */}
      {tags.length > 0 && (
        <div className="w-40">
          <Select
            value={currentTag}
            onValueChange={(val) => updateParam("tag_id", val)}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="All Tags" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tags</SelectItem>
              {tags.map((tag) => (
                <SelectItem key={tag.id} value={tag.id}>
                  {tag.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Owner Filter */}
      {salespeople.length > 0 && (
        <div className="w-44">
          <Select
            value={currentOwner}
            onValueChange={(val) => updateParam("owner_id", val)}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="All Assignees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assignees</SelectItem>
              {salespeople.map((sp) => (
                <SelectItem key={sp.id} value={sp.id}>
                  {sp.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Archived Toggle */}
      <Button
        variant={currentArchived ? "default" : "outline"}
        size="sm"
        className="h-9 text-xs"
        onClick={() =>
          updateParam("archived", currentArchived ? "false" : "true")
        }
      >
        {currentArchived ? "Viewing Archived" : "Show Archived"}
      </Button>

      {/* Reset */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          className="h-9 text-xs text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
          Reset
        </Button>
      )}
    </div>
  );
}
