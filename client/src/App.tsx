import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useWebSocket } from "@/hooks/use-websocket";
import Dashboard from "@/pages/dashboard";
import Logs from "@/pages/logs";
import Commands from "@/pages/commands";
import Config from "@/pages/config";
import UsersPage from "@/pages/users";
import ThreadsPage from "@/pages/threads";
import GuidesPage from "@/pages/guides";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/logs" component={Logs} />
      <Route path="/commands" component={Commands} />
      <Route path="/config" component={Config} />
      <Route path="/users" component={UsersPage} />
      <Route path="/threads" component={ThreadsPage} />
      <Route path="/guides" component={GuidesPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  useWebSocket();

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  const { data: session } = useQuery<{
    isConnected: boolean;
    connectionHealth: number;
  }>({
    queryKey: ["/api/session"],
    refetchInterval: 5000,
  });

  const connectionStatus: 'connected' | 'reconnecting' | 'offline' = 
    session?.isConnected 
      ? 'connected' 
      : session?.connectionHealth && session.connectionHealth > 0 
        ? 'reconnecting' 
        : 'offline';

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar connectionStatus={connectionStatus} />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center justify-between gap-2 p-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto">
            <Router />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
