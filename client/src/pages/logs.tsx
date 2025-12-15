import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Trash2, ArrowDown } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ActivityLog } from "@shared/schema";

function formatLogTime(date: Date | string | null): string {
  if (!date) return '--:--:--';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', { 
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
    case 'message':
      return <Badge variant="outline" className="text-xs uppercase w-14 justify-center">MSG</Badge>;
    default:
      return <Badge variant="secondary" className="text-xs uppercase w-14 justify-center bg-status-online/20 text-status-online">INFO</Badge>;
  }
}

export default function Logs() {
  const { toast } = useToast();
  const [autoScroll, setAutoScroll] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const { data: logs, isLoading } = useQuery<ActivityLog[]>({
    queryKey: ['/api/logs', filter],
    refetchInterval: 3000,
  });

  const clearMutation = useMutation({
    mutationFn: () => apiRequest('/api/logs', { method: 'DELETE' }),
    onSuccess: () => {
      toast({ title: "Logs cleared", description: "All logs have been cleared." });
      queryClient.invalidateQueries({ queryKey: ['/api/logs'] });
    },
    onError: () => {
      toast({ title: "Failed to clear logs", variant: "destructive" });
    },
  });

  const filteredLogs = filter === "all" 
    ? logs || []
    : (logs || []).filter(log => log.type === filter);

  const handleExport = () => {
    const content = filteredLogs.map(log => 
      `[${formatLogTime(log.timestamp)}] [${log.type.toUpperCase()}] ${log.message}${log.details ? ` - ${log.details}` : ''}`
    ).join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `goatbot-logs-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({ title: "Logs exported", description: "Logs have been downloaded." });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Logs</h1>
          <p className="text-muted-foreground">View bot activity and system logs</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button 
            variant="outline" 
            size="sm" 
            data-testid="button-clear-logs"
            onClick={() => clearMutation.mutate()}
            disabled={clearMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
          <Button variant="outline" size="sm" data-testid="button-export-logs" onClick={handleExport}>
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
                <SelectItem value="message">Message</SelectItem>
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
                {isLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <Skeleton key={i} className="h-6 w-full" />
                    ))}
                  </div>
                ) : filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 py-1 hover-elevate rounded px-2 -mx-2"
                      data-testid={`log-entry-${log.id}`}
                    >
                      <span className="text-muted-foreground whitespace-nowrap">
                        {formatLogTime(log.timestamp)}
                      </span>
                      {getLevelBadge(log.type)}
                      <span className={getLevelStyles(log.type)}>
                        {log.message}
                        {log.details && <span className="text-muted-foreground"> - {log.details}</span>}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No logs available
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>Showing {filteredLogs.length} entries</span>
            <span className="font-mono">Auto-refreshing every 3s</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
