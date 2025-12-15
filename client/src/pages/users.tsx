import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Search, MoreVertical, Shield, Ban, MessageSquare, Users } from "lucide-react";
import type { User } from "@shared/schema";

const mockUsers: User[] = [
  { id: '1', username: 'john_doe', fullName: 'John Doe', profilePic: null, isAdmin: true, isBlocked: false, messageCount: 156, experience: 1250, lastActive: new Date() },
  { id: '2', username: 'jane_smith', fullName: 'Jane Smith', profilePic: null, isAdmin: false, isBlocked: false, messageCount: 89, experience: 720, lastActive: new Date(Date.now() - 3600000) },
  { id: '3', username: 'alex_k', fullName: 'Alex Kumar', profilePic: null, isAdmin: false, isBlocked: false, messageCount: 234, experience: 1890, lastActive: new Date(Date.now() - 7200000) },
  { id: '4', username: 'maria_g', fullName: 'Maria Garcia', profilePic: null, isAdmin: false, isBlocked: true, messageCount: 45, experience: 320, lastActive: new Date(Date.now() - 86400000) },
  { id: '5', username: 'bob_wilson', fullName: 'Bob Wilson', profilePic: null, isAdmin: false, isBlocked: false, messageCount: 178, experience: 1420, lastActive: new Date(Date.now() - 172800000) },
  { id: '6', username: 'sarah_lee', fullName: 'Sarah Lee', profilePic: null, isAdmin: true, isBlocked: false, messageCount: 312, experience: 2560, lastActive: new Date(Date.now() - 1800000) },
];

function formatLastActive(date: Date | null): string {
  if (!date) return 'Never';
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

function getInitials(name: string | null, username: string): string {
  if (name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
  return username.slice(0, 2).toUpperCase();
}

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = mockUsers.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Users</h1>
          <p className="text-muted-foreground">Manage bot users and permissions</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Users</span>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold mt-1">{mockUsers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Admins</span>
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <p className="text-2xl font-bold mt-1">{mockUsers.filter(u => u.isAdmin).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Blocked</span>
              <Ban className="h-4 w-4 text-status-busy" />
            </div>
            <p className="text-2xl font-bold mt-1">{mockUsers.filter(u => u.isBlocked).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Messages</span>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold mt-1">{mockUsers.reduce((a, u) => a + (u.messageCount || 0), 0)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
          data-testid="input-search-users"
        />
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Messages</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} data-testid={`user-row-${user.username}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.profilePic || undefined} />
                          <AvatarFallback className="text-xs">
                            {getInitials(user.fullName, user.username)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">@{user.username}</p>
                          {user.fullName && (
                            <p className="text-xs text-muted-foreground">{user.fullName}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.isAdmin ? (
                        <Badge className="bg-primary/20 text-primary">Admin</Badge>
                      ) : (
                        <Badge variant="secondary">User</Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-mono">{user.messageCount}</TableCell>
                    <TableCell className="font-mono">{user.experience} XP</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatLastActive(user.lastActive)}
                    </TableCell>
                    <TableCell>
                      {user.isBlocked ? (
                        <Badge variant="destructive">Blocked</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-status-online/10 text-status-online border-status-online/20">
                          Active
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" data-testid={`button-actions-${user.username}`}>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Profile</DropdownMenuItem>
                          <DropdownMenuItem>Send Message</DropdownMenuItem>
                          <DropdownMenuItem>
                            {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            {user.isBlocked ? 'Unblock User' : 'Block User'}
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
        </CardContent>
      </Card>
    </div>
  );
}
