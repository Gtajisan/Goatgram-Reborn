import {
  type User,
  type InsertUser,
  type Thread,
  type InsertThread,
  type Command,
  type InsertCommand,
  type BotConfig,
  type InsertBotConfig,
  type Session,
  type InsertSession,
  type ActivityLog,
  type InsertActivityLog,
  type BotStats,
} from "@shared/schema";
import { randomUUID } from "crypto";
import * as fs from "fs";
import * as path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "database.json");

interface DatabaseData {
  users: Record<string, User>;
  threads: Record<string, Thread>;
  commands: Record<string, Command>;
  botConfig: BotConfig | null;
  session: Session | null;
  activityLogs: ActivityLog[];
  stats: {
    uptime: number;
    startTime: number | null;
    messagesReceived: number;
    messagesSent: number;
    commandsExecuted: number;
  };
}

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadData(): DatabaseData {
  ensureDataDir();
  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(raw);
    } catch {
      return getDefaultData();
    }
  }
  return getDefaultData();
}

function saveData(data: DatabaseData): void {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function getDefaultData(): DatabaseData {
  return {
    users: {},
    threads: {},
    commands: {},
    botConfig: {
      id: "default",
      prefix: "/",
      autoReconnect: true,
      randomUserAgent: true,
      autoMarkRead: false,
      selfListen: false,
      listenTimeout: 60000,
      listenInterval: 3000,
      proxy: null,
      language: "en",
    },
    session: {
      id: "default",
      appState: null,
      username: null,
      userId: null,
      isConnected: false,
      lastConnected: null,
      connectionHealth: 100,
    },
    activityLogs: [],
    stats: {
      uptime: 0,
      startTime: null,
      messagesReceived: 0,
      messagesSent: 0,
      commandsExecuted: 0,
    },
  };
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser & { id: string }): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: string): Promise<boolean>;

  getThread(id: string): Promise<Thread | undefined>;
  createThread(thread: InsertThread & { id: string }): Promise<Thread>;
  updateThread(id: string, updates: Partial<Thread>): Promise<Thread | undefined>;
  getAllThreads(): Promise<Thread[]>;
  deleteThread(id: string): Promise<boolean>;

  getCommand(id: string): Promise<Command | undefined>;
  getCommandByName(name: string): Promise<Command | undefined>;
  createCommand(command: InsertCommand): Promise<Command>;
  updateCommand(id: string, updates: Partial<Command>): Promise<Command | undefined>;
  getAllCommands(): Promise<Command[]>;
  deleteCommand(id: string): Promise<boolean>;

  getBotConfig(): Promise<BotConfig>;
  updateBotConfig(updates: Partial<BotConfig>): Promise<BotConfig>;

  getSession(): Promise<Session>;
  updateSession(updates: Partial<Session>): Promise<Session>;

  addLog(log: InsertActivityLog): Promise<ActivityLog>;
  getLogs(limit?: number, type?: string): Promise<ActivityLog[]>;
  clearLogs(): Promise<void>;

  getStats(): Promise<BotStats>;
  updateStats(updates: Partial<DatabaseData["stats"]>): Promise<void>;
  incrementStat(stat: "messagesReceived" | "messagesSent" | "commandsExecuted"): Promise<void>;
}

export class MemStorage implements IStorage {
  private data: DatabaseData;

  constructor() {
    this.data = loadData();
  }

  private save(): void {
    saveData(this.data);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.data.users[id];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Object.values(this.data.users).find((u) => u.username === username);
  }

  async createUser(user: InsertUser & { id: string }): Promise<User> {
    const newUser: User = {
      id: user.id,
      username: user.username,
      fullName: user.fullName ?? null,
      profilePic: user.profilePic ?? null,
      isAdmin: user.isAdmin ?? false,
      isBlocked: user.isBlocked ?? false,
      messageCount: user.messageCount ?? 0,
      experience: user.experience ?? 0,
      lastActive: user.lastActive ?? null,
    };
    this.data.users[newUser.id] = newUser;
    this.save();
    return newUser;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    if (!this.data.users[id]) return undefined;
    this.data.users[id] = { ...this.data.users[id], ...updates };
    this.save();
    return this.data.users[id];
  }

  async getAllUsers(): Promise<User[]> {
    return Object.values(this.data.users);
  }

  async deleteUser(id: string): Promise<boolean> {
    if (!this.data.users[id]) return false;
    delete this.data.users[id];
    this.save();
    return true;
  }

  async getThread(id: string): Promise<Thread | undefined> {
    return this.data.threads[id];
  }

  async createThread(thread: InsertThread & { id: string }): Promise<Thread> {
    const newThread: Thread = {
      id: thread.id,
      name: thread.name ?? null,
      isGroup: thread.isGroup ?? false,
      participantCount: thread.participantCount ?? 1,
      messageCount: thread.messageCount ?? 0,
      isMuted: thread.isMuted ?? false,
      lastMessage: thread.lastMessage ?? null,
      lastMessageTime: thread.lastMessageTime ?? null,
    };
    this.data.threads[newThread.id] = newThread;
    this.save();
    return newThread;
  }

  async updateThread(id: string, updates: Partial<Thread>): Promise<Thread | undefined> {
    if (!this.data.threads[id]) return undefined;
    this.data.threads[id] = { ...this.data.threads[id], ...updates };
    this.save();
    return this.data.threads[id];
  }

  async getAllThreads(): Promise<Thread[]> {
    return Object.values(this.data.threads);
  }

  async deleteThread(id: string): Promise<boolean> {
    if (!this.data.threads[id]) return false;
    delete this.data.threads[id];
    this.save();
    return true;
  }

  async getCommand(id: string): Promise<Command | undefined> {
    return this.data.commands[id];
  }

  async getCommandByName(name: string): Promise<Command | undefined> {
    return Object.values(this.data.commands).find((c) => c.name === name);
  }

  async createCommand(command: InsertCommand): Promise<Command> {
    const id = randomUUID();
    const newCommand: Command = {
      id,
      name: command.name,
      description: command.description ?? null,
      category: command.category ?? "general",
      usage: command.usage ?? null,
      cooldown: command.cooldown ?? 5,
      isEnabled: command.isEnabled ?? true,
      usageCount: command.usageCount ?? 0,
    };
    this.data.commands[id] = newCommand;
    this.save();
    return newCommand;
  }

  async updateCommand(id: string, updates: Partial<Command>): Promise<Command | undefined> {
    if (!this.data.commands[id]) return undefined;
    this.data.commands[id] = { ...this.data.commands[id], ...updates };
    this.save();
    return this.data.commands[id];
  }

  async getAllCommands(): Promise<Command[]> {
    return Object.values(this.data.commands);
  }

  async deleteCommand(id: string): Promise<boolean> {
    if (!this.data.commands[id]) return false;
    delete this.data.commands[id];
    this.save();
    return true;
  }

  async getBotConfig(): Promise<BotConfig> {
    if (!this.data.botConfig) {
      this.data.botConfig = getDefaultData().botConfig;
      this.save();
    }
    return this.data.botConfig!;
  }

  async updateBotConfig(updates: Partial<BotConfig>): Promise<BotConfig> {
    this.data.botConfig = { ...this.data.botConfig!, ...updates };
    this.save();
    return this.data.botConfig;
  }

  async getSession(): Promise<Session> {
    if (!this.data.session) {
      this.data.session = getDefaultData().session;
      this.save();
    }
    return this.data.session!;
  }

  async updateSession(updates: Partial<Session>): Promise<Session> {
    this.data.session = { ...this.data.session!, ...updates };
    this.save();
    return this.data.session;
  }

  async addLog(log: InsertActivityLog): Promise<ActivityLog> {
    const newLog: ActivityLog = {
      id: randomUUID(),
      type: log.type,
      message: log.message,
      details: log.details ?? null,
      timestamp: new Date(),
    };
    this.data.activityLogs.unshift(newLog);
    if (this.data.activityLogs.length > 1000) {
      this.data.activityLogs = this.data.activityLogs.slice(0, 1000);
    }
    this.save();
    return newLog;
  }

  async getLogs(limit: number = 100, type?: string): Promise<ActivityLog[]> {
    let logs = this.data.activityLogs;
    if (type && type !== "all") {
      logs = logs.filter((l) => l.type === type);
    }
    return logs.slice(0, limit);
  }

  async clearLogs(): Promise<void> {
    this.data.activityLogs = [];
    this.save();
  }

  async getStats(): Promise<BotStats> {
    const session = await this.getSession();
    const users = await this.getAllUsers();
    const threads = await this.getAllThreads();

    let uptime = 0;
    if (this.data.stats.startTime && session.isConnected) {
      uptime = Math.floor((Date.now() - this.data.stats.startTime) / 1000);
    }

    return {
      uptime,
      totalUsers: users.length,
      totalThreads: threads.length,
      messagesReceived: this.data.stats.messagesReceived,
      messagesSent: this.data.stats.messagesSent,
      commandsExecuted: this.data.stats.commandsExecuted,
      connectionStatus: session.isConnected ? "connected" : "offline",
      connectionHealth: session.connectionHealth ?? 100,
    };
  }

  async updateStats(updates: Partial<DatabaseData["stats"]>): Promise<void> {
    this.data.stats = { ...this.data.stats, ...updates };
    this.save();
  }

  async incrementStat(stat: "messagesReceived" | "messagesSent" | "commandsExecuted"): Promise<void> {
    this.data.stats[stat]++;
    this.save();
  }
}

export const storage = new MemStorage();
