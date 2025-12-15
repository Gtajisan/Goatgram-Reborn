import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";

interface BroadcastMessage {
  type: 'stats' | 'session' | 'log' | 'command' | 'user' | 'thread';
  data: any;
}

class WebSocketManager {
  private wss: WebSocketServer | null = null;
  private clients: Set<WebSocket> = new Set();

  init(server: Server): void {
    this.wss = new WebSocketServer({ server, path: "/ws" });

    this.wss.on("connection", (ws) => {
      this.clients.add(ws);
      console.log(`[WebSocket] Client connected. Total: ${this.clients.size}`);

      ws.on("close", () => {
        this.clients.delete(ws);
        console.log(`[WebSocket] Client disconnected. Total: ${this.clients.size}`);
      });

      ws.on("error", (error) => {
        console.error("[WebSocket] Error:", error.message);
        this.clients.delete(ws);
      });

      ws.send(JSON.stringify({ type: "connected", message: "WebSocket connected" }));
    });

    console.log("[WebSocket] Server initialized on /ws");
  }

  broadcast(message: BroadcastMessage): void {
    if (!this.wss) return;

    const data = JSON.stringify(message);
    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(data);
        } catch (error) {
          this.clients.delete(client);
        }
      }
    }
  }

  broadcastStats(stats: any): void {
    this.broadcast({ type: "stats", data: stats });
  }

  broadcastSession(session: any): void {
    this.broadcast({ type: "session", data: session });
  }

  broadcastLog(log: any): void {
    this.broadcast({ type: "log", data: log });
  }

  getClientCount(): number {
    return this.clients.size;
  }
}

export const wsManager = new WebSocketManager();
