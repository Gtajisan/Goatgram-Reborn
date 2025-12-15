import { useEffect, useRef, useCallback } from "react";
import { queryClient } from "@/lib/queryClient";

type MessageType = 'stats' | 'session' | 'log' | 'command' | 'user' | 'thread' | 'connected';

interface WebSocketMessage {
  type: MessageType;
  data?: any;
  message?: string;
}

export function useWebSocket() {
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log("[WebSocket] Connected");
      reconnectAttempts.current = 0;
    };

    ws.current.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        
        switch (message.type) {
          case 'stats':
            queryClient.setQueryData(['/api/stats'], message.data);
            break;
          case 'session':
            queryClient.setQueryData(['/api/session'], message.data);
            break;
          case 'log':
            queryClient.invalidateQueries({ queryKey: ['/api/logs'] });
            break;
          case 'command':
            queryClient.invalidateQueries({ queryKey: ['/api/commands'] });
            break;
          case 'user':
            queryClient.invalidateQueries({ queryKey: ['/api/users'] });
            break;
          case 'thread':
            queryClient.invalidateQueries({ queryKey: ['/api/threads'] });
            break;
        }
      } catch (error) {
        console.error("[WebSocket] Parse error:", error);
      }
    };

    ws.current.onclose = () => {
      console.log("[WebSocket] Disconnected");
      scheduleReconnect();
    };

    ws.current.onerror = (error) => {
      console.error("[WebSocket] Error:", error);
    };
  }, []);

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeout.current) return;

    reconnectAttempts.current++;
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);

    reconnectTimeout.current = setTimeout(() => {
      reconnectTimeout.current = null;
      connect();
    }, delay);
  }, [connect]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [connect]);

  return { isConnected: ws.current?.readyState === WebSocket.OPEN };
}
