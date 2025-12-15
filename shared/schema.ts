import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

// Instagram Users tracked by the bot
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  username: text("username").notNull(),
  fullName: text("full_name"),
  profilePic: text("profile_pic"),
  isAdmin: boolean("is_admin").default(false),
  isBlocked: boolean("is_blocked").default(false),
  messageCount: integer("message_count").default(0),
  experience: integer("experience").default(0),
  lastActive: timestamp("last_active"),
});

// Threads (DMs and Group Chats)
export const threads = pgTable("threads", {
  id: varchar("id").primaryKey(),
  name: text("name"),
  isGroup: boolean("is_group").default(false),
  participantCount: integer("participant_count").default(1),
  messageCount: integer("message_count").default(0),
  isMuted: boolean("is_muted").default(false),
  lastMessage: text("last_message"),
  lastMessageTime: timestamp("last_message_time"),
});

// Bot Commands
export const commands = pgTable("commands", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description"),
  category: text("category").default("general"),
  usage: text("usage"),
  cooldown: integer("cooldown").default(5),
  isEnabled: boolean("is_enabled").default(true),
  usageCount: integer("usage_count").default(0),
});

// Bot Configuration
export const botConfig = pgTable("bot_config", {
  id: varchar("id").primaryKey().default("default"),
  prefix: text("prefix").default("/"),
  autoReconnect: boolean("auto_reconnect").default(true),
  randomUserAgent: boolean("random_user_agent").default(true),
  autoMarkRead: boolean("auto_mark_read").default(false),
  selfListen: boolean("self_listen").default(false),
  listenTimeout: integer("listen_timeout").default(60000),
  listenInterval: integer("listen_interval").default(3000),
  proxy: text("proxy"),
  language: text("language").default("en"),
});

// Session/AppState
export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default("default"),
  appState: jsonb("app_state"),
  username: text("username"),
  userId: text("user_id"),
  isConnected: boolean("is_connected").default(false),
  lastConnected: timestamp("last_connected"),
  connectionHealth: integer("connection_health").default(100),
});

// Activity Logs
export const activityLogs = pgTable("activity_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // 'info', 'warn', 'error', 'message'
  message: text("message").notNull(),
  details: text("details"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertThreadSchema = createInsertSchema(threads).omit({ id: true });
export const insertCommandSchema = createInsertSchema(commands).omit({ id: true });
export const insertBotConfigSchema = createInsertSchema(botConfig).omit({ id: true });
export const insertSessionSchema = createInsertSchema(sessions).omit({ id: true });
export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({ id: true, timestamp: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Thread = typeof threads.$inferSelect;
export type InsertThread = z.infer<typeof insertThreadSchema>;

export type Command = typeof commands.$inferSelect;
export type InsertCommand = z.infer<typeof insertCommandSchema>;

export type BotConfig = typeof botConfig.$inferSelect;
export type InsertBotConfig = z.infer<typeof insertBotConfigSchema>;

export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;

// Frontend-only types for dashboard
export interface BotStats {
  uptime: number;
  totalUsers: number;
  totalThreads: number;
  messagesReceived: number;
  messagesSent: number;
  commandsExecuted: number;
  connectionStatus: 'connected' | 'reconnecting' | 'offline';
  connectionHealth: number;
}

export interface LoginCredentials {
  type: 'appState' | 'credentials';
  appState?: string;
  username?: string;
  password?: string;
  proxy?: string;
}
