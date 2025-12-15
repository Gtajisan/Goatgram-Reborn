import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, Plus, Terminal, Clock, Zap, FileCode } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Command } from "@shared/schema";

function getCategoryColor(category: string | null) {
  switch (category) {
    case 'admin':
      return 'bg-status-busy/20 text-status-busy';
    case 'moderation':
      return 'bg-status-away/20 text-status-away';
    case 'fun':
      return 'bg-primary/20 text-primary';
    default:
      return 'bg-status-online/20 text-status-online';
  }
}

export default function Commands() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: commands, isLoading } = useQuery<Command[]>({
    queryKey: ['/api/commands'],
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isEnabled }: { id: string; isEnabled: boolean }) =>
      apiRequest(`/api/commands/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isEnabled }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/commands'] });
    },
    onError: () => {
      toast({ title: "Failed to update command", variant: "destructive" });
    },
  });

  const allCommands = commands || [];
  const categories = [...new Set(allCommands.map(cmd => cmd.category).filter(Boolean))] as string[];

  const filteredCommands = allCommands.filter(cmd => {
    const matchesSearch = cmd.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cmd.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || cmd.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleToggle = (command: Command) => {
    toggleMutation.mutate({ id: command.id, isEnabled: !command.isEnabled });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Commands</h1>
          <p className="text-muted-foreground">Manage and configure bot commands</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button data-testid="button-add-command">
              <Plus className="h-4 w-4 mr-2" />
              Add Command
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Custom Command</DialogTitle>
              <DialogDescription>
                Create a new command by providing a JavaScript file or use the command builder.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 text-center text-muted-foreground">
              <FileCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Command builder coming soon</p>
              <p className="text-sm mt-2">For now, add command files to the /scripts folder</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search commands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-commands"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
            data-testid="filter-all"
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category === selectedCategory ? null : category)}
              data-testid={`filter-${category}`}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <Terminal className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold mt-1">{allCommands.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Enabled</span>
              <Zap className="h-4 w-4 text-status-online" />
            </div>
            <p className="text-2xl font-bold mt-1">{allCommands.filter(c => c.isEnabled).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Disabled</span>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold mt-1">{allCommands.filter(c => !c.isEnabled).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Uses</span>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold mt-1">{allCommands.reduce((a, c) => a + (c.usageCount || 0), 0)}</p>
          </CardContent>
        </Card>
      </div>

      <ScrollArea className="h-[calc(100vh-400px)]">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCommands.map((command) => (
              <Card key={command.id} className="hover-elevate" data-testid={`command-card-${command.name}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Terminal className="h-4 w-4 text-primary" />
                      <CardTitle className="text-base font-mono">/{command.name}</CardTitle>
                    </div>
                    <Switch
                      checked={command.isEnabled ?? false}
                      onCheckedChange={() => handleToggle(command)}
                      data-testid={`switch-command-${command.name}`}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{command.description || 'No description'}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className={getCategoryColor(command.category)}>
                      {command.category || 'general'}
                    </Badge>
                    <Badge variant="outline" className="font-mono text-xs">
                      {command.cooldown || 5}s cooldown
                    </Badge>
                  </div>
                  <div className="pt-2 border-t flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Usage:</span>
                    <code className="font-mono text-xs bg-muted px-2 py-1 rounded">{command.usage || `/${command.name}`}</code>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Times used:</span>
                    <span className="font-mono">{command.usageCount || 0}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
