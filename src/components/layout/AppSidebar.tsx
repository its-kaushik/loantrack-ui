import { 
  LayoutDashboard, 
  Calendar, 
  CalendarDays, 
  Users, 
  FileText, 
  AlertTriangle,
  Settings,
  LogOut,
  Landmark,
  TrendingUp
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const mainNavItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Monthly Loans", url: "/loans/monthly", icon: Calendar },
  { title: "Daily Loans", url: "/loans/daily", icon: CalendarDays },
  { title: "Borrowers", url: "/borrowers", icon: Users },
];

const managementItems = [
  { title: "Reports", url: "/reports", icon: TrendingUp },
  { title: "Collateral", url: "/collateral", icon: FileText },
  { title: "Defaulters", url: "/defaulters", icon: AlertTriangle },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user, logout } = useAuth();
  const collapsed = state === "collapsed";

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const getInitials = (name: string | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-accent">
            <Landmark className="h-5 w-5 text-sidebar-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-sidebar-foreground">LoanTrack</span>
              <span className="text-xs text-sidebar-foreground/70">Loan Management</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60 text-xs uppercase tracking-wider">
            {!collapsed && "Main"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <NavLink 
                      to={item.url}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                        isActive(item.url) 
                          ? 'bg-sidebar-accent text-sidebar-foreground' 
                          : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                      }`}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-4 bg-sidebar-border" />

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60 text-xs uppercase tracking-wider">
            {!collapsed && "Management"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <NavLink 
                      to={item.url}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                        isActive(item.url) 
                          ? 'bg-sidebar-accent text-sidebar-foreground' 
                          : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                      }`}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        {user && (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 bg-sidebar-accent">
              <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground text-sm">
                {getInitials(user.fullName || user.name)}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{user.fullName || user.name || user.email || 'User'}</p>
                <p className="text-xs text-sidebar-foreground/60 truncate">{user.role}</p>
              </div>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={logout}
              className="shrink-0 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
