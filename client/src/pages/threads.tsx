import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Search, MoreVertical, MessageSquare, Users, Volume2, VolumeX } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Thread } from "@shared/schema";

function formatLastMessage(date: Date | string | null): string {
  if (!date) return 'Never';
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString();
}

function getThreadInitials(name: string | null, isGroup: boolean): string {
  if (!name) return isGroup ? 'GC' : 'DM';
  if (isGroup) {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }
  return name.slice(0, 2).toUpperCase();
}

export default function ThreadsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<'all' | 'groups' | 'dms'>('all');

  const { data: threads, isLoading } = useQuery<Thread[]>({
    queryKey: ['/api/threads'],
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Thread> }) =>
      apiRequest(`/api/threads/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/threads'] });
      toast({ title: "Thread updated" });
    },
    onError: () => {
      toast({ title: "Update failed", variant: "destructive" });
    },
  });

  const allThreads = threads || [];
  const filteredThreads = allThreads.filter(thread => {
    const matchesSearch = thread.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || 
      (filter === 'groups' && thread.isGroup) || 
      (filter === 'dms' && !thread.isGroup);
    return matchesSearch && matchesFilter;
  });

  const handleToggleMute = (thread: Thread) => {
    updateMutation.mutate({ id: thread.id, updates: { isMuted: !thread.isMuted } });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Threads</h1>
          <p className="text-muted-foreground">Manage DMs and group conversations</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Threads</span>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold mt-1">{allThreads.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Groups</span>
              <Users className="h-4 w-4 text-primary" />
            </div>
            <p className="text-2xl font-bold mt-1">{allThreads.filter(t => t.isGroup).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Direct Messages</span>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold mt-1">{allThreads.filter(t => !t.isGroup).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Muted</span>
              <VolumeX className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold mt-1">{allThreads.filter(t => t.isMuted).length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search threads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-threads"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
            data-testid="filter-all-threads"
          >
            All
          </Button>
          <Button
            variant={filter === 'groups' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('groups')}
            data-testid="filter-groups"
          >
            Groups
          </Button>
          <Button
            variant={filter === 'dms' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('dms')}
            data-testid="filter-dms"
          >
            DMs
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Threads</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredThreads.length > 0 ? (
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Thread</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Participants</TableHead>
                    <TableHead>Messages</TableHead>
                    <TableHead>Last Message</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredThreads.map((thread) => (
                    <TableRow key={thread.id} data-testid={`thread-row-${thread.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className={`text-xs ${thread.isGroup ? 'bg-primary/20 text-primary' : ''}`}>
                              {getThreadInitials(thread.name, thread.isGroup ?? false)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium truncate max-w-[200px]">
                              {thread.isGroup ? thread.name : `@${thread.name}`}
                            </p>
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {thread.lastMessage || 'No messages'}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {thread.isGroup ? (
                          <Badge variant="secondary" className="bg-primary/10 text-primary">
                            <Users className="h-3 w-3 mr-1" />
                            Group
                          </Badge>
                        ) : (
                          <Badge variant="outline">DM</Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-mono">{thread.participantCount || 1}</TableCell>
                      <TableCell className="font-mono">{thread.messageCount || 0}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatLastMessage(thread.lastMessageTime)}
                      </TableCell>
                      <TableCell>
                        {thread.isMuted ? (
                          <Badge variant="secondary" className="gap-1">
                            <VolumeX className="h-3 w-3" />
                            Muted
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1 bg-status-online/10 text-status-online border-status-online/20">
                            <Volume2 className="h-3 w-3" />
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" data-testid={`button-actions-${thread.id}`}>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleToggleMute(thread)}>
                              {thread.isMuted ? 'Unmute' : 'Mute'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              {searchQuery ? 'No threads match your search' : 'No threads yet'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
