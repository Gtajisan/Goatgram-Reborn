import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Trash2, ArrowDown } from "lucide-react";

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  source?: string;
}

const mockLogs: LogEntry[] = [
  { id: '1', timestamp: new Date(), level: 'info', message: '[FCA] Session initialized successfully', source: 'instagram-fca' },
  { id: '2', timestamp: new Date(Date.now() - 1000), level: 'info', message: '[MQTT] Connected to Instagram messaging service', source: 'mqtt' },
  { id: '3', timestamp: new Date(Date.now() - 2000), level: 'debug', message: '[CMD] Loaded command: /help', source: 'commands' },
  { id: '4', timestamp: new Date(Date.now() - 3000), level: 'debug', message: '[CMD] Loaded command: /ping', source: 'commands' },
  { id: '5', timestamp: new Date(Date.now() - 5000), level: 'warn', message: '[RATE] Rate limit at 75% - slowing down requests', source: 'rate-limiter' },
  { id: '6', timestamp: new Date(Date.now() - 10000), level: 'info', message: '[MSG] Received message from thread_123456', source: 'listener' },
  { id: '7', timestamp: new Date(Date.now() - 15000), level: 'info', message: '[MSG] Sent response to thread_123456', source: 'sender' },
  { id: '8', timestamp: new Date(Date.now() - 20000), level: 'error', message: '[API] Failed to fetch user profile - Retrying...', source: 'api' },
  { id: '9', timestamp: new Date(Date.now() - 25000), level: 'info', message: '[API] Retry successful - User profile fetched', source: 'api' },
  { id: '10', timestamp: new Date(Date.now() - 30000), level: 'info', message: '[BOT] GoatBot v2 started successfully', source: 'core' },
];

function formatLogTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });
}

function getLevelStyles(level: string) {
  switch (level) {
    case 'error':
      return 'text-status-busy';
    case 'warn':
      return 'text-status-away';
    case 'debug':
      return 'text-muted-foreground';
    default:
      return 'text-status-online';
  }
}

function getLevelBadge(level: string) {
  switch (level) {
    case 'error':
      return <Badge variant="destructive" className="text-xs uppercase w-14 justify-center">ERR</Badge>;
    case 'warn':
      return <Badge variant="secondary" className="text-xs uppercase w-14 justify-center bg-status-away/20 text-status-away">WARN</Badge>;
    case 'debug':
      return <Badge variant="outline" className="text-xs uppercase w-14 justify-center">DBG</Badge>;
    default:
      return <Badge variant="secondary" className="text-xs uppercase w-14 justify-center bg-status-online/20 text-status-online">INFO</Badge>;
  }
}

export default function Logs() {
  const [autoScroll, setAutoScroll] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const filteredLogs = filter === "all" 
    ? mockLogs 
    : mockLogs.filter(log => log.level === filter);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Logs</h1>
          <p className="text-muted-foreground">View bot activity and system logs</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" data-testid="button-clear-logs">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
          <Button variant="outline" size="sm" data-testid="button-export-logs">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
          <CardTitle className="text-base">System Logs</CardTitle>
          <div className="flex items-center gap-4 flex-wrap">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-32" data-testid="select-log-filter">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warn">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="debug">Debug</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Switch
                id="auto-scroll"
                checked={autoScroll}
                onCheckedChange={setAutoScroll}
                data-testid="switch-auto-scroll"
              />
              <Label htmlFor="auto-scroll" className="text-sm flex items-center gap-1">
                <ArrowDown className="h-3 w-3" />
                Auto-scroll
              </Label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-background rounded-md border">
            <ScrollArea className="h-[500px]">
              <div className="p-4 font-mono text-sm space-y-1">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 py-1 hover-elevate rounded px-2 -mx-2"
                    data-testid={`log-entry-${log.id}`}
                  >
                    <span className="text-muted-foreground whitespace-nowrap">
                      {formatLogTime(log.timestamp)}
                    </span>
                    {getLevelBadge(log.level)}
                    <span className={getLevelStyles(log.level)}>
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>Showing {filteredLogs.length} entries</span>
            <span className="font-mono">Last updated: Just now</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
