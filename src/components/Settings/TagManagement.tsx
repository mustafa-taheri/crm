"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { createTag } from "@/lib/actions/customers";
import { deleteTag } from "@/lib/actions/users";
import { Tag, Plus, Trash2 } from "lucide-react";

interface TagItem {
  id: string;
  name: string;
  created_at: string;
}

export function TagManagement({ tags }: { tags: TagItem[] }) {
  const router = useRouter();
  const [tagName, setTagName] = React.useState("");
  const [adding, setAdding] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName.trim()) return;

    setAdding(true);
    try {
      const res = await createTag(tagName.trim());
      if (!res.error) {
        setTagName("");
        router.refresh();
      } else {
        alert(res.error);
      }
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      !confirm(
        `Are you sure you want to delete tag "${name}"? It will be removed from all customers.`,
      )
    )
      return;
    setDeletingId(id);
    try {
      await deleteTag(id);
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Tag */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create Customer Tag</CardTitle>
          <CardDescription>
            Add free-form segmentation tags (e.g. VIP, Corporate, Retail,
            Diwali2026).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex gap-2 max-w-md">
            <Input
              placeholder="Tag name..."
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              className="h-9"
              required
            />
            <Button
              type="submit"
              size="sm"
              disabled={adding || !tagName.trim()}
              className="h-9"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              {adding ? "Adding..." : "Add Tag"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Tag List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Existing Tags ({tags.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tags.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No tags created yet.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2.5">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center gap-2 pl-3 pr-1.5 py-1 rounded-full border bg-muted/30 text-xs font-semibold text-foreground group hover:border-primary/50 transition-colors"
                >
                  <Tag className="h-3 w-3 text-primary" />
                  <span>{tag.name}</span>
                  <button
                    type="button"
                    onClick={() => handleDelete(tag.id, tag.name)}
                    disabled={deletingId === tag.id}
                    className="h-5 w-5 rounded-full flex items-center justify-center text-muted-foreground hover:text-error hover:bg-error/10 transition-colors"
                    title="Delete tag"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
