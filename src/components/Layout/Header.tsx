"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useUser } from "@/lib/hooks/useUser"
import { logout } from "@/lib/actions/auth"
import { LogOut } from "lucide-react"

export function Header({ className }: { className?: string }) {
  const { profile } = useUser()

  return (
    <header
      className={cn(
        "flex h-14 items-center justify-between border-b bg-background px-4",
        className
      )}
    >
      <h1 className="text-lg font-semibold">Tohfawala CRM</h1>
      <div className="flex items-center gap-3">
        {profile?.full_name && (
          <span className="text-sm font-medium">{profile.full_name}</span>
        )}
        <form action={logout}>
          <Button variant="ghost" size="sm" type="submit">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </form>
      </div>
    </header>
  )
}
