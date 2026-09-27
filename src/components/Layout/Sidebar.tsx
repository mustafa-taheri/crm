"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Megaphone,
  CalendarCheck,
  BarChart3,
  Settings,
  ChevronDown,
} from "lucide-react";
import { useUser } from "@/lib/hooks/useUser";

interface NavItem {
  label: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
  children?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    label: "Customers",
    href: "/customers",
    icon: Users,
    children: [
      { label: "All Customers", href: "/customers" },
      { label: "Add Customer", href: "/customers/add" },
      { label: "Import CSV/XLSX", href: "/customers/import" },
    ],
  },
  {
    label: "WhatsApp",
    icon: MessageSquare,
    children: [
      { label: "Inbox", href: "/whatsapp/inbox" },
      { label: "Campaigns", href: "/whatsapp/campaigns" },
      { label: "Templates", href: "/whatsapp/campaigns/templates" },
    ],
  },
  { label: "Follow-ups", href: "/follow-ups", icon: CalendarCheck },
  {
    label: "Reports",
    href: "/reports",
    icon: BarChart3,
    children: [
      { label: "Overview", href: "/reports" },
      { label: "Campaigns", href: "/reports/campaigns" },
      { label: "Customer Status", href: "/reports/customer-status" },
      { label: "Follow-ups", href: "/reports/follow-ups" },
      { label: "Sales Activity", href: "/reports/salesperson" },
    ],
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    adminOnly: true,
    children: [
      { label: "Team Members", href: "/settings/users" },
      { label: "Tags", href: "/settings/tags" },
    ],
  },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { role } = useUser();

  return (
    <aside
      className={cn(
        "flex h-full w-64 flex-col overflow-y-auto border-r bg-background p-4 text-foreground shrink-0",
        className,
      )}
    >
      <div className="space-y-1">
        {navItems.map((item) => {
          if (item.adminOnly && role !== "admin") return null;

          const isDirectActive = item.href ? pathname === item.href : false;
          const hasActiveChild = item.children?.some(
            (child) =>
              pathname === child.href || pathname.startsWith(child.href + "/"),
          );
          const isSectionActive = isDirectActive || hasActiveChild;

          if (item.children) {
            return (
              <div key={item.label} className="space-y-1">
                <div
                  className={cn(
                    "flex items-center justify-between rounded-md px-3 py-2 text-sm font-semibold transition-colors",
                    isSectionActive
                      ? "text-primary font-bold"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                </div>
                <div className="ml-7 space-y-0.5 border-l pl-2 border-border">
                  {item.children.map((child) => {
                    const isChildActive =
                      pathname === child.href ||
                      (child.href !== "/reports" &&
                        child.href !== "/customers" &&
                        pathname.startsWith(child.href));
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "block rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                          isChildActive
                            ? "bg-primary-100 text-primary font-semibold"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground",
                        )}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href!}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isDirectActive
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
