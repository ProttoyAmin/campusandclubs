// lib/socket-service.ts
type MessageHandler = (data: any) => void;

class SocketService {
    private ws: WebSocket | null = null;
    private listeners = new Map<string, Set<MessageHandler>>();
    private reconnectAttempts = 0;
    private url: string;

    constructor(url: string) {
        this.url = url;
    }

    connect() {
        if (this.ws && this.ws.readyState !== WebSocket.CLOSED) return; // already connected/connecting

        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
            console.log("[socket] connected");
            this.reconnectAttempts = 0;
        };

        this.ws.onmessage = (e) => {
            const parsed = JSON.parse(e.data);
            const type = parsed.type;
            this.listeners.get(type)?.forEach((handler) => handler(parsed.data));
        };

        this.ws.onclose = (e) => {
            console.log("[socket] closed", e.code, e.reason);
            if (e.code !== 1000) this.scheduleReconnect(); // 1000 = normal/manual close, don't retry
        };

        this.ws.onerror = (e) => console.error("[socket] error", e);
    }

    private scheduleReconnect() {
        const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30000);
        this.reconnectAttempts++;
        setTimeout(() => this.connect(), delay);
    }

    disconnect() {
        this.ws?.close(1000, "manual disconnect");
        this.ws = null;
        this.listeners.clear();
    }

    send(type: string, payload: Record<string, unknown> = {}) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type, ...payload }));
        } else {
            console.warn("[socket] send skipped, not open:", type);
        }
    }

    on(type: string, handler: MessageHandler) {
        if (!this.listeners.has(type)) this.listeners.set(type, new Set());
        this.listeners.get(type)!.add(handler);
        return () => {
            this.listeners.get(type)?.delete(handler)
        };
    }
}

export const socket = new SocketService("ws://localhost:8000/ws/socket/");
export const socketTyped = new WebSocket("ws://localhost:8000/ws/socket/");