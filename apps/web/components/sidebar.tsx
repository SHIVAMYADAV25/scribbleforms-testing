// apps/web/components/sidebar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileText, BarChart2, Users, Palette,
  Settings, Share2, LogOut, ChevronLeft, ChevronRight,
  Globe
} from "lucide-react";
import { cn } from "~/lib/utils";
import { useUIStore } from "~/stores/ui.store";
import { useLogout, useMe } from "~/hooks/api/auth";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Skeleton } from "~/components/ui/skeleton";

const navItems = [
  { href: "/dashboard",                label: "Dashboard",  icon: LayoutDashboard },
  { href: "/dashboard/forms",          label: "Forms",      icon: FileText },
  { href: "/dashboard/analytics",      label: "Analytics",  icon: BarChart2 },
  { href: "/dashboard/responses",      label: "Responses",  icon: Users },
  { href: "/dashboard/themes",         label: "Themes",     icon: Palette },
  { href: "/explore",                  label: "Explore",    icon: Globe },
  { href: "/dashboard/settings",       label: "Settings",   icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { data: me, isLoading } = useMe();
  const logout = useLogout();

  return (
    <aside className={cn(
      "flex flex-col h-screen border-r bg-card transition-all duration-200 flex-shrink-0",
      sidebarCollapsed ? "w-16" : "w-56"
    )}>
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b h-14">
        {!sidebarCollapsed && (
          <span className="font-bold text-base truncate">ScribbleForms</span>
        )}
        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={toggleSidebar}>
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}>
              <Icon className="h-4 w-4 shrink-0" />
              {!sidebarCollapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="p-2 border-t">
        {isLoading ? (
          <div className="flex items-center gap-2 px-2 py-1.5">
            <Skeleton className="h-7 w-7 rounded-full" />
            {!sidebarCollapsed && <Skeleton className="h-4 w-24" />}
          </div>
        ) : me ? (
          <div className="flex items-center gap-2 px-2 py-1.5">
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarFallback className="text-xs">
                {me.fullName?.charAt(0) ?? me.email.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{me.fullName ?? me.email}</p>
                <p className="text-xs text-muted-foreground capitalize">{me.plan}</p>
              </div>
            )}
          </div>
        ) : null}
        <Button
          variant="ghost" size="sm"
          className={cn("w-full mt-1 text-muted-foreground", sidebarCollapsed ? "px-0 justify-center" : "justify-start gap-2")}
          onClick={() => logout.mutate(undefined)}
          disabled={logout.isPending}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!sidebarCollapsed && "Logout"}
        </Button>
      </div>
    </aside>
  );
}
