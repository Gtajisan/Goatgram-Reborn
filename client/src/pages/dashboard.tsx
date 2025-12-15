import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StatusIndicator, HealthBar } from "@/components/status-indicator";
import {
  Clock,
  Users,
  MessageSquare,
  Zap,
  RefreshCw,
  Download,
  Power,
  Send,
  Inbox,
} from "lucide-react";
import type { BotStats, ActivityLog } from "@shared/schema";

// Mock data for development - will be replaced with API calls
const mockStats: BotStats = {
  uptime: 86400000, // 24 hours in ms
  totalUsers: 156,
  totalThreads: 42,
  messagesReceived: 1247,
  messagesSent: 892,
  commandsExecuted: 324,
  connectionStatus: 'connected',
  connectionHealth: 95,
};

const mockActivity: ActivityLog[] = [
  { id: '1', type: 'message', message: 'Received message from @john_doe', details: 'Thread: Main Group', timestamp: new Date() },
  { id: '2', type: 'info', message: 'Command /help executed successfully', details: 'User: @jane_smith', timestamp: new Date(Date.now() - 60000) },
  { id: '3', type: 'warn', message: 'Rate limit approaching', details: '85% of limit used', timestamp: new Date(Date.now() - 120000) },
  { id: '4', type: 'message', message: 'Sent response to @alex_k', details: 'Thread: DM', timestamp: new Date(Date.now() - 180000) },
  { id: '5', type: 'info', message: 'New user registered: @new_user123', details: null, timestamp: new Date(Date.now() - 240000) },
];

function formatUptime(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  return `${hours}h ${minutes}m`;
}

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString();
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
  const stats = mockStats;
  const activity = mockActivity;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground">Monitor your bot's performance and activity</p>
        </div>
        <StatusIndicator status={stats.connectionStatus} size="lg" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-uptime">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Uptime</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{formatUptime(stats.uptime)}</div>
            <p className="text-xs text-muted-foreground mt-1">Since last restart</p>
          </CardContent>
        </Card>

        <Card data-testid="card-users">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered users</p>
          </CardContent>
        </Card>

        <Card data-testid="card-threads">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Threads</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalThreads}</div>
            <p className="text-xs text-muted-foreground mt-1">DMs and Groups</p>
          </CardContent>
        </Card>

        <Card data-testid="card-commands">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Commands Today</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.commandsExecuted}</div>
            <p className="text-xs text-muted-foreground mt-1">Commands executed</p>
          </CardContent>
        </Card>
      </div>

      {/* Message Stats & Connection Health */}
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
              <span className="font-mono font-semibold">{stats.messagesReceived.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Sent</span>
              </div>
              <span className="font-mono font-semibold">{stats.messagesSent.toLocaleString()}</span>
            </div>
            <div className="pt-2 border-t">
              <HealthBar health={stats.connectionHealth} />
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="lg:col-span-1" data-testid="card-actions">
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start gap-2" data-testid="button-restart">
              <RefreshCw className="h-4 w-4" />
              Restart Bot
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" data-testid="button-refresh-session">
              <Power className="h-4 w-4" />
              Refresh Session
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" data-testid="button-export-logs">
              <Download className="h-4 w-4" />
              Export Logs
            </Button>
          </CardContent>
        </Card>

        {/* Connection Status Card */}
        <Card className="lg:col-span-1" data-testid="card-connection">
          <CardHeader>
            <CardTitle className="text-base">Connection Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <StatusIndicator status={stats.connectionStatus} showLabel={true} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Health</span>
              <Badge variant={stats.connectionHealth >= 80 ? "default" : "secondary"}>
                {stats.connectionHealth}%
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Last Update</span>
              <span className="text-sm font-mono">Just now</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card data-testid="card-activity">
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-base">Recent Activity</CardTitle>
          <Badge variant="outline" className="font-mono text-xs">Live</Badge>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              {activity.map((log) => (
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
                      {formatTimestamp(log.timestamp!)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
