import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusIndicator, HealthBar } from "@/components/status-indicator";
import {
  Clock,
  Users,
  MessageSquare,
  Zap,
  RefreshCw,
  Power,
  Send,
  Inbox,
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { BotStats, ActivityLog } from "@shared/schema";

function formatUptime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  return `${hours}h ${minutes}m`;
}

function formatTimestamp(date: Date | string | null): string {
  if (!date) return 'Never';
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString();
}

function getLogTypeStyles(type: string) {
  switch (type) {
    case 'error':
      return 'border-l-status-busy bg-status-busy/5';
    case 'warn':
      return 'border-l-status-away bg-status-away/5';
    case 'message':
      return 'border-l-primary bg-primary/5';
    default:
      return 'border-l-status-online bg-status-online/5';
  }
}

export default function Dashboard() {
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading } = useQuery<BotStats>({
    queryKey: ['/api/stats'],
    refetchInterval: 5000,
  });

  const { data: activity, isLoading: activityLoading } = useQuery<ActivityLog[]>({
    queryKey: ['/api/logs'],
    refetchInterval: 5000,
  });

  const restartMutation = useMutation({
    mutationFn: () => apiRequest('/api/bot/restart', { method: 'POST' }),
    onSuccess: () => {
      toast({ title: "Bot restarting", description: "The bot is being restarted." });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    },
    onError: () => {
      toast({ title: "Restart failed", description: "Could not restart the bot.", variant: "destructive" });
    },
  });

  const stopMutation = useMutation({
    mutationFn: () => apiRequest('/api/bot/stop', { method: 'POST' }),
    onSuccess: () => {
      toast({ title: "Bot stopped", description: "The bot has been stopped." });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    },
    onError: () => {
      toast({ title: "Stop failed", description: "Could not stop the bot.", variant: "destructive" });
    },
  });

  const connectionStatus = stats?.connectionStatus || 'offline';

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground">Monitor your bot's performance and activity</p>
        </div>
        <StatusIndicator status={connectionStatus} size="lg" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-uptime">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Uptime</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold font-mono">{formatUptime(stats?.uptime || 0)}</div>
                <p className="text-xs text-muted-foreground mt-1">Since last restart</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-users">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{(stats?.totalUsers || 0).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Registered users</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-threads">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Threads</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.totalThreads || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">DMs and Groups</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-commands">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Commands Executed</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.commandsExecuted || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Total commands</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1" data-testid="card-messages">
          <CardHeader>
            <CardTitle className="text-base">Message Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Inbox className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Received</span>
              </div>
              <span className="font-mono font-semibold">{(stats?.messagesReceived || 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Sent</span>
              </div>
              <span className="font-mono font-semibold">{(stats?.messagesSent || 0).toLocaleString()}</span>
            </div>
            <div className="pt-2 border-t">
              <HealthBar health={stats?.connectionHealth || 0} />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1" data-testid="card-actions">
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2" 
              data-testid="button-restart"
              onClick={() => restartMutation.mutate()}
              disabled={restartMutation.isPending}
            >
              <RefreshCw className={`h-4 w-4 ${restartMutation.isPending ? 'animate-spin' : ''}`} />
              {restartMutation.isPending ? 'Restarting...' : 'Restart Bot'}
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2" 
              data-testid="button-stop"
              onClick={() => stopMutation.mutate()}
              disabled={stopMutation.isPending || connectionStatus === 'offline'}
            >
              <Power className="h-4 w-4" />
              {stopMutation.isPending ? 'Stopping...' : 'Stop Bot'}
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1" data-testid="card-connection">
          <CardHeader>
            <CardTitle className="text-base">Connection Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <StatusIndicator status={connectionStatus} showLabel={true} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Health</span>
              <Badge variant={(stats?.connectionHealth || 0) >= 80 ? "default" : "secondary"}>
                {stats?.connectionHealth || 0}%
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Last Update</span>
              <span className="text-sm font-mono">Just now</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-activity">
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-base">Recent Activity</CardTitle>
          <Badge variant="outline" className="font-mono text-xs">Live</Badge>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] pr-4">
            {activityLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : activity && activity.length > 0 ? (
              <div className="space-y-2">
                {activity.slice(0, 20).map((log) => (
                  <div
                    key={log.id}
                    className={`p-3 rounded-md border-l-2 ${getLogTypeStyles(log.type)}`}
                    data-testid={`activity-log-${log.id}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{log.message}</p>
                        {log.details && (
                          <p className="text-xs text-muted-foreground mt-0.5">{log.details}</p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No activity yet
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
