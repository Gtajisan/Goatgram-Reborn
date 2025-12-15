import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  ScrollText,
  Terminal,
  Settings,
  Users,
  MessageSquare,
  BookOpen,
  Bot,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { StatusIndicator } from "@/components/status-indicator";
import { Badge } from "@/components/ui/badge";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Logs",
    url: "/logs",
    icon: ScrollText,
  },
  {
    title: "Commands",
    url: "/commands",
    icon: Terminal,
  },
  {
    title: "Configuration",
    url: "/config",
    icon: Settings,
  },
  {
    title: "Users",
    url: "/users",
    icon: Users,
  },
  {
    title: "Threads",
    url: "/threads",
    icon: MessageSquare,
  },
  {
    title: "Guides",
    url: "/guides",
    icon: BookOpen,
  },
];

interface AppSidebarProps {
  connectionStatus?: 'connected' | 'reconnecting' | 'offline';
}

export function AppSidebar({ connectionStatus = 'offline' }: AppSidebarProps) {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary">
            <Bot className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-lg">GoatBot v2</span>
            <span className="text-xs text-muted-foreground">Instagram Port</span>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <StatusIndicator status={connectionStatus} size="sm" />
          <Badge variant="outline" className="text-xs font-mono">
            v2.0.0
          </Badge>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const isActive = location === item.url || 
                  (item.url !== "/" && location.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      data-testid={`nav-${item.title.toLowerCase()}`}
                    >
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>Developed by <span className="font-semibold text-foreground">Gtajisan</span></p>
          <p className="font-mono">ffjisan804@gmail.com</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
