"use client";

import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/hooks/useUser";
import { logout } from "@/lib/actions/auth";

export function Header({ className }: { className?: string }) {
  const { profile } = useUser();

  return (
    <header
      className={cn(
        "flex h-14 items-center justify-between border-b bg-background px-6 shadow-sm",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <span className="font-bold text-lg text-primary">TOHFAWALA</span>
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary-100 text-primary uppercase tracking-wide">
          CRM
        </span>
      </div>

      <div className="flex items-center gap-4">
        {profile && (
          <div className="flex items-center gap-2 border-l pl-4">
            <div className="flex flex-col items-end text-right">
              <span className="text-sm font-semibold text-foreground leading-tight">
                {profile.full_name}
              </span>
              <span className="text-xs text-muted-foreground capitalize">
                {profile.role}
              </span>
            </div>
          </div>
        )}

        <form action={logout}>
          <Button
            variant="ghost"
            size="sm"
            type="submit"
            className="text-muted-foreground hover:text-error"
          >
            <LogOut className="mr-1.5 h-4 w-4" />
            Sign Out
          </Button>
        </form>
      </div>
    </header>
  );
}
