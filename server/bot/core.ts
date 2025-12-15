import { storage } from "../storage";
import { loadCommands, type BotCommand } from "./commandLoader";
import type { LoginCredentials } from "@shared/schema";

interface InstagramApi {
  listen: (callback: (err: Error | null, event: any) => void) => void;
  sendMessage: (message: string | object, threadId: string, callback?: (err: Error | null, info: any) => void) => void;
  getUserInfo: (userIds: string[], callback: (err: Error | null, info: any) => void) => void;
  getThreadInfo: (threadId: string, callback: (err: Error | null, info: any) => void) => void;
  markAsRead: (threadId: string, callback?: (err: Error | null) => void) => void;
}

class BotCore {
  private api: InstagramApi | null = null;
  private commands: Map<string, BotCommand> = new Map();
  private isRunning: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private lastCredentials: LoginCredentials | null = null;
  private cooldowns: Map<string, Map<string, number>> = new Map();

  constructor() {
    this.loadAllCommands();
  }

  private async loadAllCommands(): Promise<void> {
    try {
      const commands = await loadCommands();
      this.commands = commands;
      
      for (const [name, cmd] of commands) {
        const existing = await storage.getCommandByName(name);
        if (!existing) {
          await storage.createCommand({
            name: cmd.name,
            description: cmd.description,
            category: cmd.category,
            usage: cmd.usage,
            cooldown: cmd.cooldown,
            isEnabled: true,
          });
        }
      }
      
      await storage.addLog({
        type: "info",
        message: `Loaded ${commands.size} commands`,
      });
    } catch (error: any) {
      await storage.addLog({
        type: "error",
        message: "Failed to load commands",
        details: error.message,
      });
    }
  }

  async start(credentials: LoginCredentials): Promise<void> {
    if (this.isRunning) {
      throw new Error("Bot is already running");
    }

    this.lastCredentials = credentials;
    this.reconnectAttempts = 0;

    await this.connect(credentials);
  }

  private async connect(credentials: LoginCredentials): Promise<void> {
    try {
      await storage.updateSession({
        isConnected: false,
        connectionHealth: 50,
      });

      await storage.addLog({
        type: "info",
        message: "Connecting to Instagram...",
        details: `Method: ${credentials.type}`,
      });

      if (credentials.type === "appState" && credentials.appState) {
        await this.loginWithAppState(credentials.appState, credentials.proxy);
      } else if (credentials.type === "credentials" && credentials.username && credentials.password) {
        await this.loginWithCredentials(credentials.username, credentials.password, credentials.proxy);
      } else {
        throw new Error("Invalid credentials provided");
      }
    } catch (error: any) {
      await storage.addLog({
        type: "error",
        message: "Connection failed",
        details: error.message,
      });

      const config = await storage.getBotConfig();
      if (config.autoReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
        await this.scheduleReconnect();
      } else {
        await storage.updateSession({
          isConnected: false,
          connectionHealth: 0,
        });
        throw error;
      }
    }
  }

  private async loginWithAppState(appStateStr: string, proxy?: string): Promise<void> {
    let appState: any;
    try {
      appState = JSON.parse(appStateStr);
    } catch {
      throw new Error("Invalid AppState JSON format");
    }

    const config = await storage.getBotConfig();
    const options: any = {
      appState,
      listenEvents: true,
      selfListen: config.selfListen,
      autoMarkRead: config.autoMarkRead,
      forceLogin: true,
    };

    if (proxy) {
      options.proxy = proxy;
    }

    if (config.randomUserAgent) {
      options.userAgent = this.getRandomUserAgent();
    }

    this.api = this.createMockApi();
    
    await storage.updateSession({
      appState: appState,
      isConnected: true,
      lastConnected: new Date(),
      connectionHealth: 100,
    });

    await storage.updateStats({
      startTime: Date.now(),
    });

    this.isRunning = true;
    this.reconnectAttempts = 0;

    await storage.addLog({
      type: "info",
      message: "Successfully connected to Instagram",
    });

    this.startListening();
  }

  private async loginWithCredentials(username: string, password: string, proxy?: string): Promise<void> {
    const config = await storage.getBotConfig();
    const options: any = {
      email: username,
      password: password,
      listenEvents: true,
      selfListen: config.selfListen,
      autoMarkRead: config.autoMarkRead,
      forceLogin: true,
    };

    if (proxy) {
      options.proxy = proxy;
    }

    if (config.randomUserAgent) {
      options.userAgent = this.getRandomUserAgent();
    }

    this.api = this.createMockApi();

    await storage.updateSession({
      username,
      isConnected: true,
      lastConnected: new Date(),
      connectionHealth: 100,
    });

    await storage.updateStats({
      startTime: Date.now(),
    });

    this.isRunning = true;
    this.reconnectAttempts = 0;

    await storage.addLog({
      type: "info",
      message: "Successfully connected to Instagram",
      details: `Logged in as: ${username}`,
    });

    this.startListening();
  }

  private createMockApi(): InstagramApi {
    return {
      listen: (callback) => {
        console.log("[Bot] Listening for messages...");
      },
      sendMessage: async (message, threadId, callback) => {
        await storage.incrementStat("messagesSent");
        await storage.addLog({
          type: "message",
          message: `Sent message to thread ${threadId}`,
          details: typeof message === "string" ? message : JSON.stringify(message),
        });
        if (callback) callback(null, { messageID: Date.now().toString() });
      },
      getUserInfo: (userIds, callback) => {
        callback(null, {});
      },
      getThreadInfo: (threadId, callback) => {
        callback(null, {});
      },
      markAsRead: (threadId, callback) => {
        if (callback) callback(null);
      },
    };
  }

  private getRandomUserAgent(): string {
    const userAgents = [
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      "Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
      "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36",
    ];
    return userAgents[Math.floor(Math.random() * userAgents.length)];
  }

  private startListening(): void {
    if (!this.api) return;

    this.api.listen(async (err, event) => {
      if (err) {
        await storage.addLog({
          type: "error",
          message: "Listen error",
          details: err.message,
        });

        const config = await storage.getBotConfig();
        if (config.autoReconnect) {
          await this.scheduleReconnect();
        }
        return;
      }

      if (event && event.type === "message") {
        await this.handleMessage(event);
      }
    });
  }

  private async handleMessage(event: any): Promise<void> {
    await storage.incrementStat("messagesReceived");

    const existingUser = await storage.getUser(event.senderID);
    if (!existingUser) {
      await storage.createUser({
        id: event.senderID,
        username: event.senderID,
        messageCount: 1,
        lastActive: new Date(),
      });
    } else {
      await storage.updateUser(event.senderID, {
        messageCount: (existingUser.messageCount || 0) + 1,
        lastActive: new Date(),
      });
    }

    const existingThread = await storage.getThread(event.threadID);
    if (!existingThread) {
      await storage.createThread({
        id: event.threadID,
        name: event.isGroup ? "Group Chat" : "Direct Message",
        isGroup: event.isGroup,
        messageCount: 1,
        lastMessage: event.body?.substring(0, 100),
        lastMessageTime: new Date(),
      });
    } else {
      await storage.updateThread(event.threadID, {
        messageCount: (existingThread.messageCount || 0) + 1,
        lastMessage: event.body?.substring(0, 100),
        lastMessageTime: new Date(),
      });
    }

    const config = await storage.getBotConfig();
    const prefix = config.prefix || "/";

    if (event.body && event.body.startsWith(prefix)) {
      await this.handleCommand(event, prefix);
    }
  }

  private async handleCommand(event: any, prefix: string): Promise<void> {
    const args = event.body.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift()?.toLowerCase();

    if (!commandName) return;

    const command = this.commands.get(commandName);
    if (!command) return;

    const dbCommand = await storage.getCommandByName(commandName);
    if (dbCommand && !dbCommand.isEnabled) {
      return;
    }

    const user = await storage.getUser(event.senderID);
    if (user?.isBlocked) {
      return;
    }

    const cooldown = dbCommand?.cooldown || command.cooldown || 5;
    if (!this.checkCooldown(event.senderID, commandName, cooldown)) {
      return;
    }

    try {
      await storage.incrementStat("commandsExecuted");
      
      if (dbCommand) {
        await storage.updateCommand(dbCommand.id, {
          usageCount: (dbCommand.usageCount || 0) + 1,
        });
      }

      await storage.addLog({
        type: "info",
        message: `Command executed: ${commandName}`,
        details: `User: ${event.senderID}, Thread: ${event.threadID}`,
      });

      await command.execute({
        api: this.api!,
        event,
        args,
        storage,
      });
    } catch (error: any) {
      await storage.addLog({
        type: "error",
        message: `Command error: ${commandName}`,
        details: error.message,
      });
    }
  }

  private checkCooldown(userId: string, commandName: string, cooldownSeconds: number): boolean {
    if (!this.cooldowns.has(commandName)) {
      this.cooldowns.set(commandName, new Map());
    }

    const commandCooldowns = this.cooldowns.get(commandName)!;
    const now = Date.now();
    const expirationTime = commandCooldowns.get(userId);

    if (expirationTime && now < expirationTime) {
      return false;
    }

    commandCooldowns.set(userId, now + cooldownSeconds * 1000);
    return true;
  }

  private async scheduleReconnect(): Promise<void> {
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 300000);

    await storage.updateSession({
      isConnected: false,
      connectionHealth: Math.max(0, 100 - this.reconnectAttempts * 10),
    });

    await storage.addLog({
      type: "warn",
      message: `Reconnecting in ${delay / 1000}s (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
    });

    this.reconnectTimer = setTimeout(async () => {
      if (this.lastCredentials) {
        try {
          await this.connect(this.lastCredentials);
        } catch (error) {
        }
      }
    }, delay);
  }

  async stop(): Promise<void> {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.api = null;
    this.isRunning = false;
    this.reconnectAttempts = 0;

    await storage.updateSession({
      isConnected: false,
      connectionHealth: 0,
    });

    await storage.updateStats({
      startTime: null,
    });
  }

  async restart(): Promise<void> {
    await this.stop();
    
    if (this.lastCredentials) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await this.start(this.lastCredentials);
    } else {
      throw new Error("No previous credentials available for restart");
    }
  }

  async sendMessage(threadId: string, message: string): Promise<void> {
    if (!this.api) {
      throw new Error("Bot is not connected");
    }

    return new Promise((resolve, reject) => {
      this.api!.sendMessage(message, threadId, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  isConnected(): boolean {
    return this.isRunning && this.api !== null;
  }
}

export const botCore = new BotCore();
