import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Save, AlertCircle, Key, Shield, Settings, Globe, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { BotConfig, Session, LoginCredentials } from "@shared/schema";

export default function Config() {
  const { toast } = useToast();
  const [loginType, setLoginType] = useState<'appState' | 'credentials'>('appState');
  const [appState, setAppState] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [proxy, setProxy] = useState("");

  const { data: config, isLoading: configLoading } = useQuery<BotConfig>({
    queryKey: ['/api/config'],
  });

  const { data: session, isLoading: sessionLoading } = useQuery<Session>({
    queryKey: ['/api/session'],
  });

  const configMutation = useMutation({
    mutationFn: (updates: Partial<BotConfig>) =>
      apiRequest('/api/config', { method: 'PATCH', body: JSON.stringify(updates) }),
    onSuccess: () => {
      toast({ title: "Configuration saved", description: "Your settings have been updated." });
      queryClient.invalidateQueries({ queryKey: ['/api/config'] });
    },
    onError: () => {
      toast({ title: "Save failed", variant: "destructive" });
    },
  });

  const startMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      apiRequest('/api/bot/start', { method: 'POST', body: JSON.stringify(credentials) }),
    onSuccess: () => {
      toast({ title: "Bot starting", description: "Connecting to Instagram..." });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/session'] });
    },
    onError: (error: any) => {
      toast({ title: "Start failed", description: error.message || "Could not start the bot.", variant: "destructive" });
    },
  });

  const handleStart = () => {
    const credentials: LoginCredentials = {
      type: loginType,
      proxy: proxy || undefined,
    };

    if (loginType === 'appState') {
      if (!appState.trim()) {
        toast({ title: "AppState required", description: "Please paste your AppState JSON.", variant: "destructive" });
        return;
      }
      credentials.appState = appState;
    } else {
      if (!username || !password) {
        toast({ title: "Credentials required", description: "Please enter username and password.", variant: "destructive" });
        return;
      }
      credentials.username = username;
      credentials.password = password;
    }

    startMutation.mutate(credentials);
  };

  const handleSave = () => {
    const prefix = (document.getElementById('prefix') as HTMLInputElement)?.value || '/';
    const language = 'en';
    const listenTimeout = parseInt((document.getElementById('listen-timeout') as HTMLInputElement)?.value) || 60000;
    const listenInterval = parseInt((document.getElementById('listen-interval') as HTMLInputElement)?.value) || 3000;

    configMutation.mutate({
      prefix,
      language,
      listenTimeout,
      listenInterval,
      proxy: proxy || null,
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Configuration</h1>
          <p className="text-muted-foreground">Manage bot settings and authentication</p>
        </div>
        <Button onClick={handleSave} disabled={configMutation.isPending} data-testid="button-save-config">
          <Save className="h-4 w-4 mr-2" />
          {configMutation.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="auth" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="auth" data-testid="tab-auth">
            <Key className="h-4 w-4 mr-2" />
            Auth
          </TabsTrigger>
          <TabsTrigger value="bot" data-testid="tab-bot">
            <Settings className="h-4 w-4 mr-2" />
            Bot
          </TabsTrigger>
          <TabsTrigger value="advanced" data-testid="tab-advanced">
            <Shield className="h-4 w-4 mr-2" />
            Advanced
          </TabsTrigger>
        </TabsList>

        <TabsContent value="auth" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Key className="h-5 w-5" />
                Login Method
              </CardTitle>
              <CardDescription>
                Choose how the bot authenticates with Instagram
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Button
                  variant={loginType === 'appState' ? 'default' : 'outline'}
                  onClick={() => setLoginType('appState')}
                  data-testid="button-login-appstate"
                >
                  AppState (Cookies)
                </Button>
                <Button
                  variant={loginType === 'credentials' ? 'default' : 'outline'}
                  onClick={() => setLoginType('credentials')}
                  data-testid="button-login-credentials"
                >
                  Username/Password
                </Button>
              </div>

              {loginType === 'appState' ? (
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-md">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-status-away shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium">Recommended Method</p>
                        <p className="text-muted-foreground mt-1">
                          Using AppState (cookies) is safer and less likely to trigger security checks.
                          See the Guides section for how to extract your AppState.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="appstate">AppState JSON</Label>
                    <Textarea
                      id="appstate"
                      placeholder='Paste your appstate.json content here...'
                      className="font-mono text-sm min-h-[150px]"
                      value={appState}
                      onChange={(e) => setAppState(e.target.value)}
                      data-testid="input-appstate"
                    />
                    <p className="text-xs text-muted-foreground">
                      Get this from browser cookies or use the c3c-fbstate extension
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-destructive">Use with Caution</p>
                        <p className="text-muted-foreground mt-1">
                          Direct login may trigger Instagram security checks. Use a dedicated account
                          and enable 2FA for better security.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Instagram Username</Label>
                      <Input
                        id="username"
                        placeholder="your_username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        data-testid="input-username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="********"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        data-testid="input-password"
                      />
                    </div>
                  </div>
                </div>
              )}

              <Button 
                onClick={handleStart} 
                disabled={startMutation.isPending}
                className="w-full"
                data-testid="button-start-bot"
              >
                <Play className="h-4 w-4 mr-2" />
                {startMutation.isPending ? 'Connecting...' : 'Start Bot'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Proxy Configuration
              </CardTitle>
              <CardDescription>
                Optional: Route requests through a proxy server
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="proxy">Proxy URL</Label>
                <Input
                  id="proxy"
                  placeholder="socks5://127.0.0.1:1080"
                  className="font-mono"
                  value={proxy}
                  onChange={(e) => setProxy(e.target.value)}
                  data-testid="input-proxy"
                />
                <p className="text-xs text-muted-foreground">
                  Supports HTTP, HTTPS, and SOCKS5 protocols
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bot" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">General Settings</CardTitle>
              <CardDescription>Basic bot configuration options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {configLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-48" />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="prefix">Command Prefix</Label>
                    <Input
                      id="prefix"
                      defaultValue={config?.prefix || '/'}
                      className="max-w-[100px] font-mono"
                      data-testid="input-prefix"
                    />
                    <p className="text-xs text-muted-foreground">
                      Character(s) that trigger bot commands
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Bot Language</Label>
                    <Select defaultValue={config?.language || 'en'}>
                      <SelectTrigger className="max-w-[200px]" data-testid="select-language">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="vi">Vietnamese</SelectItem>
                        <SelectItem value="bn">Bengali</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Behavior Settings</CardTitle>
              <CardDescription>Control how the bot responds and behaves</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto Reconnect</Label>
                  <p className="text-xs text-muted-foreground">Automatically reconnect when disconnected</p>
                </div>
                <Switch defaultChecked={config?.autoReconnect ?? true} data-testid="switch-auto-reconnect" />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto Mark Read</Label>
                  <p className="text-xs text-muted-foreground">Mark messages as read automatically</p>
                </div>
                <Switch defaultChecked={config?.autoMarkRead ?? false} data-testid="switch-auto-mark-read" />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Self Listen</Label>
                  <p className="text-xs text-muted-foreground">Listen to your own messages</p>
                </div>
                <Switch defaultChecked={config?.selfListen ?? false} data-testid="switch-self-listen" />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Random User Agent</Label>
                  <p className="text-xs text-muted-foreground">Use random user agents for requests</p>
                </div>
                <Switch defaultChecked={config?.randomUserAgent ?? true} data-testid="switch-random-ua" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Timing Configuration</CardTitle>
              <CardDescription>Fine-tune request timing to avoid rate limits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="listen-timeout">Listen Timeout (ms)</Label>
                  <Input
                    id="listen-timeout"
                    type="number"
                    defaultValue={config?.listenTimeout || 60000}
                    className="font-mono"
                    data-testid="input-listen-timeout"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="listen-interval">Listen Interval (ms)</Label>
                  <Input
                    id="listen-interval"
                    type="number"
                    defaultValue={config?.listenInterval || 3000}
                    className="font-mono"
                    data-testid="input-listen-interval"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Higher intervals reduce rate limit risk but increase message delay
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                Session Status
                <Badge variant="outline" className="ml-2">Debug</Badge>
              </CardTitle>
              <CardDescription>Current session information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {sessionLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <div className="grid gap-2 font-mono text-sm">
                  <div className="flex justify-between p-2 bg-muted rounded">
                    <span className="text-muted-foreground">Connected:</span>
                    <span>{session?.isConnected ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-muted rounded">
                    <span className="text-muted-foreground">User ID:</span>
                    <span>{session?.userId || '—'}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-muted rounded">
                    <span className="text-muted-foreground">Health:</span>
                    <span>{session?.connectionHealth || 0}%</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
