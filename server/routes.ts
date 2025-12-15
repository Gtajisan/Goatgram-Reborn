import type { Express, Request, Response } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { botCore } from "./bot/core";
import { insertBotConfigSchema, insertActivityLogSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get("/api/stats", async (_req: Request, res: Response) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to get stats" });
    }
  });

  app.get("/api/config", async (_req: Request, res: Response) => {
    try {
      const config = await storage.getBotConfig();
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: "Failed to get config" });
    }
  });

  app.patch("/api/config", async (req: Request, res: Response) => {
    try {
      const updates = insertBotConfigSchema.partial().parse(req.body);
      const config = await storage.updateBotConfig(updates);
      await storage.addLog({
        type: "info",
        message: "Bot configuration updated",
        details: JSON.stringify(updates),
      });
      res.json(config);
    } catch (error) {
      res.status(400).json({ error: "Invalid config data" });
    }
  });

  app.get("/api/session", async (_req: Request, res: Response) => {
    try {
      const session = await storage.getSession();
      const sanitized = {
        ...session,
        appState: session.appState ? "[HIDDEN]" : null,
      };
      res.json(sanitized);
    } catch (error) {
      res.status(500).json({ error: "Failed to get session" });
    }
  });

  app.get("/api/logs", async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const type = req.query.type as string;
      const logs = await storage.getLogs(limit, type);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to get logs" });
    }
  });

  app.delete("/api/logs", async (_req: Request, res: Response) => {
    try {
      await storage.clearLogs();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to clear logs" });
    }
  });

  app.get("/api/commands", async (_req: Request, res: Response) => {
    try {
      const commands = await storage.getAllCommands();
      res.json(commands);
    } catch (error) {
      res.status(500).json({ error: "Failed to get commands" });
    }
  });

  app.patch("/api/commands/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const command = await storage.updateCommand(id, updates);
      if (!command) {
        return res.status(404).json({ error: "Command not found" });
      }
      res.json(command);
    } catch (error) {
      res.status(400).json({ error: "Failed to update command" });
    }
  });

  app.get("/api/users", async (_req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to get users" });
    }
  });

  app.patch("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const user = await storage.updateUser(id, updates);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Failed to update user" });
    }
  });

  app.get("/api/threads", async (_req: Request, res: Response) => {
    try {
      const threads = await storage.getAllThreads();
      res.json(threads);
    } catch (error) {
      res.status(500).json({ error: "Failed to get threads" });
    }
  });

  app.patch("/api/threads/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const thread = await storage.updateThread(id, updates);
      if (!thread) {
        return res.status(404).json({ error: "Thread not found" });
      }
      res.json(thread);
    } catch (error) {
      res.status(400).json({ error: "Failed to update thread" });
    }
  });

  const loginSchema = z.object({
    type: z.enum(["appState", "credentials"]),
    appState: z.string().optional(),
    username: z.string().optional(),
    password: z.string().optional(),
    proxy: z.string().optional(),
  });

  app.post("/api/bot/start", async (req: Request, res: Response) => {
    try {
      const credentials = loginSchema.parse(req.body);
      await botCore.start(credentials);
      await storage.addLog({
        type: "info",
        message: "Bot start initiated",
        details: `Login type: ${credentials.type}`,
      });
      res.json({ success: true, message: "Bot starting..." });
    } catch (error: any) {
      await storage.addLog({
        type: "error",
        message: "Failed to start bot",
        details: error.message,
      });
      res.status(400).json({ error: error.message || "Failed to start bot" });
    }
  });

  app.post("/api/bot/stop", async (_req: Request, res: Response) => {
    try {
      await botCore.stop();
      await storage.addLog({
        type: "info",
        message: "Bot stopped",
      });
      res.json({ success: true, message: "Bot stopped" });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to stop bot" });
    }
  });

  app.post("/api/bot/restart", async (_req: Request, res: Response) => {
    try {
      await botCore.restart();
      await storage.addLog({
        type: "info",
        message: "Bot restarted",
      });
      res.json({ success: true, message: "Bot restarting..." });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to restart bot" });
    }
  });

  app.post("/api/bot/send", async (req: Request, res: Response) => {
    try {
      const { threadId, message } = req.body;
      if (!threadId || !message) {
        return res.status(400).json({ error: "threadId and message required" });
      }
      await botCore.sendMessage(threadId, message);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to send message" });
    }
  });

  return httpServer;
}
