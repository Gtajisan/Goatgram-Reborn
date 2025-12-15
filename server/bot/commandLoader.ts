import * as fs from "fs";
import * as path from "path";
import type { IStorage } from "../storage";

interface InstagramApi {
  sendMessage: (message: string | object, threadId: string, callback?: (err: Error | null, info: any) => void) => void;
  getUserInfo: (userIds: string[], callback: (err: Error | null, info: any) => void) => void;
  getThreadInfo: (threadId: string, callback: (err: Error | null, info: any) => void) => void;
  markAsRead: (threadId: string, callback?: (err: Error | null) => void) => void;
}

interface MessageEvent {
  threadID: string;
  senderID: string;
  body: string;
  isGroup: boolean;
  messageID: string;
}

export interface CommandContext {
  api: InstagramApi;
  event: MessageEvent;
  args: string[];
  storage: IStorage;
}

export interface BotCommand {
  name: string;
  description: string;
  category: string;
  usage: string;
  cooldown: number;
  execute: (context: CommandContext) => Promise<void>;
}

const SCRIPTS_DIR = path.join(process.cwd(), "scripts");

const builtInCommands: BotCommand[] = [
  {
    name: "help",
    description: "Shows available commands and their usage",
    category: "utility",
    usage: "/help [command]",
    cooldown: 3,
    execute: async ({ api, event, args, storage }) => {
      const commands = await storage.getAllCommands();
      const enabledCommands = commands.filter((c) => c.isEnabled);

      if (args[0]) {
        const cmd = enabledCommands.find((c) => c.name === args[0].toLowerCase());
        if (cmd) {
          const message = `Command: ${cmd.name}\nDescription: ${cmd.description || "No description"}\nUsage: ${cmd.usage || `/${cmd.name}`}\nCategory: ${cmd.category}\nCooldown: ${cmd.cooldown}s`;
          api.sendMessage(message, event.threadID);
        } else {
          api.sendMessage(`Command "${args[0]}" not found.`, event.threadID);
        }
        return;
      }

      const categories: Record<string, string[]> = {};
      for (const cmd of enabledCommands) {
        const cat = cmd.category || "general";
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(cmd.name);
      }

      let message = "Available Commands:\n\n";
      for (const [category, cmds] of Object.entries(categories)) {
        message += `${category.toUpperCase()}:\n`;
        message += cmds.map((c) => `  /${c}`).join("\n") + "\n\n";
      }
      message += "Use /help [command] for more info.";

      api.sendMessage(message, event.threadID);
    },
  },
  {
    name: "ping",
    description: "Check bot response time",
    category: "utility",
    usage: "/ping",
    cooldown: 3,
    execute: async ({ api, event }) => {
      const start = Date.now();
      api.sendMessage(`Pong! Response time: ${Date.now() - start}ms`, event.threadID);
    },
  },
  {
    name: "uptime",
    description: "Shows bot uptime",
    category: "utility",
    usage: "/uptime",
    cooldown: 5,
    execute: async ({ api, event, storage }) => {
      const stats = await storage.getStats();
      const uptime = stats.uptime;
      
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = uptime % 60;
      
      api.sendMessage(`Bot Uptime: ${hours}h ${minutes}m ${seconds}s`, event.threadID);
    },
  },
  {
    name: "stats",
    description: "Shows bot statistics",
    category: "utility",
    usage: "/stats",
    cooldown: 5,
    execute: async ({ api, event, storage }) => {
      const stats = await storage.getStats();
      
      const message = `Bot Statistics:\n\nUsers: ${stats.totalUsers}\nThreads: ${stats.totalThreads}\nMessages Received: ${stats.messagesReceived}\nMessages Sent: ${stats.messagesSent}\nCommands Executed: ${stats.commandsExecuted}\nStatus: ${stats.connectionStatus}`;
      
      api.sendMessage(message, event.threadID);
    },
  },
  {
    name: "uid",
    description: "Get user ID",
    category: "utility",
    usage: "/uid [@mention]",
    cooldown: 3,
    execute: async ({ api, event }) => {
      api.sendMessage(`Your User ID: ${event.senderID}`, event.threadID);
    },
  },
  {
    name: "tid",
    description: "Get thread/conversation ID",
    category: "utility",
    usage: "/tid",
    cooldown: 3,
    execute: async ({ api, event }) => {
      api.sendMessage(`Thread ID: ${event.threadID}`, event.threadID);
    },
  },
  {
    name: "say",
    description: "Make the bot say something",
    category: "fun",
    usage: "/say [message]",
    cooldown: 3,
    execute: async ({ api, event, args }) => {
      if (args.length === 0) {
        api.sendMessage("Please provide a message to say.", event.threadID);
        return;
      }
      api.sendMessage(args.join(" "), event.threadID);
    },
  },
  {
    name: "about",
    description: "About this bot",
    category: "info",
    usage: "/about",
    cooldown: 5,
    execute: async ({ api, event }) => {
      const message = `GoatBot v2 - Instagram Port\n\nDeveloped by: Gtajisan\nContact: ffjisan804@gmail.com\n\nPowered by Instagram-FCA library.\nUse /help for available commands.`;
      api.sendMessage(message, event.threadID);
    },
  },
];

export async function loadCommands(): Promise<Map<string, BotCommand>> {
  const commands = new Map<string, BotCommand>();

  for (const cmd of builtInCommands) {
    commands.set(cmd.name, cmd);
  }

  if (fs.existsSync(SCRIPTS_DIR)) {
    try {
      const files = fs.readdirSync(SCRIPTS_DIR).filter((f) => f.endsWith(".js") || f.endsWith(".ts"));
      
      for (const file of files) {
        try {
          const filePath = path.join(SCRIPTS_DIR, file);
          const stat = fs.statSync(filePath);
          
          if (stat.isFile()) {
            console.log(`[CommandLoader] Found script: ${file}`);
          }
        } catch (err) {
          console.error(`[CommandLoader] Error loading ${file}:`, err);
        }
      }
    } catch (err) {
      console.error("[CommandLoader] Error reading scripts directory:", err);
    }
  }

  return commands;
}
