# WebSocket Architecture — Django Channels + TypeScript Frontend

A reference for structuring a single, centralized WebSocket connection per
user, with type-safe events on both ends. No signals in this document —
that's a separate concern layered on top later.

---

## Core principles

1. **One socket per connected user.** Not one per feature (chat, notifications,
   presence). A single persistent connection carries everything.
2. **One consumer per connection _type_.** A new consumer is justified only
   by a genuinely different transport, protocol, or auth model (e.g. WebRTC
   signaling, a public unauthenticated socket) — never by a different
   _feature_ on the same authenticated user.
3. **Groups are topics, not features.** `chat_{room_id}`, `feed_home`,
   `notifications_{user_id}` — join/leave dynamically as the user navigates.
4. **The consumer stays a thin dispatcher.** It never contains feature logic
   — only routing from an inbound `type` to a handler function, and from a
   group event `type` to an outbound push.
5. **Event names are constants, never raw strings**, on both the Python and
   TypeScript sides, so a typo fails at import/compile time instead of
   silently dropping a message.

---

## Backend folder structure

```
apps/realtime/
├── consumers.py          # thin dispatcher — stays small forever
├── event_types.py         # constants for every event name + group naming
├── routing.py              # websocket_urlpatterns
├── models.py
├── serializers.py
├── views.py                # REST endpoints (history, room creation, etc.)
├── urls.py
└── handlers/
    ├── __init__.py          # INBOUND_HANDLERS registry
    ├── chat.py
    ├── feed.py
    └── presence.py
```

## Frontend folder structure

```
src/
├── lib/
│   └── socket-service.ts     # singleton connection manager
├── types/
│   └── ws-events.ts            # discriminated union of every event
├── hooks/
│   └── use-socket-event.ts     # typed subscription hook
└── providers/
    └── socket-provider.tsx     # connects/disconnects on auth state
```

---

## Backend: event constants

Centralize every event name and group-naming convention in one file. Nothing
else should contain a raw string for these.

```python
# apps/realtime/event_types.py

class WSEvent:
    """Outbound message types (server -> client) and inbound
    dispatch keys (client -> server) that flow over the socket."""

    # Chat
    CHAT_JOIN = "chat_join"
    CHAT_LEAVE = "chat_leave"
    CHAT_MESSAGE = "chat_message"

    # Feed
    FEED_SUBSCRIBE = "feed_subscribe"
    FEED_UNSUBSCRIBE = "feed_unsubscribe"
    FEED_UPDATE = "feed_update"

    # Notifications
    NOTIFICATION = "notification_message"

    # Presence
    PRESENCE_UPDATE = "presence_update"

    # Protocol-level
    ERROR = "error"


def chat_group(room_id) -> str:
    return f"chat_{room_id}"

def feed_group(topic: str) -> str:
    return f"feed_{topic}"

def notification_group(user_id) -> str:
    return f"notifications_{user_id}"
```

## Backend: typed payloads

Use `TypedDict` (stdlib, zero dependencies) to describe the shape of each
event's data. This doesn't enforce anything at runtime, but it makes handler
signatures self-documenting and gives you IDE/mypy checking when handlers
build or consume payloads.

```python
# apps/realtime/payloads.py
from typing import TypedDict, Optional
from uuid import UUID

class ChatJoinPayload(TypedDict):
    type: str
    room_id: str

class ChatMessagePayload(TypedDict):
    type: str
    room_id: str
    content: str

class ChatMessageEvent(TypedDict):
    id: str
    room_id: str
    sender_id: str
    content: str
    created_at: str

class NotificationEvent(TypedDict):
    id: str
    verb: str
    description: str
    is_read: bool
    created_at: str
```

If you want _runtime_ validation of inbound client messages (recommended
once this grows — malformed client input shouldn't reach handler logic),
use `pydantic` models instead of bare `TypedDict` and call `.model_validate()`
in the consumer before dispatch. `TypedDict` alone gives you static checking
only.

```python
# apps/realtime/payloads.py (pydantic variant)
from pydantic import BaseModel

class ChatMessageIn(BaseModel):
    room_id: str
    content: str
```

## Backend: consumer (thin dispatcher, never grows)

```python
# apps/realtime/consumers.py
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from .handlers import INBOUND_HANDLERS, chat, feed, presence
from .event_types import WSEvent

class AppSocketConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        if not self.user or not self.user.is_authenticated:
            await self.close()
            return

        self.joined_rooms: set[str] = set()
        self.subscribed_feeds: set[str] = set()

        await self.accept()
        await presence.mark_online(self)

    async def disconnect(self, close_code):
        await presence.mark_offline(self)

    async def receive_json(self, content: dict):
        handler = INBOUND_HANDLERS.get(content.get("type"))
        if handler is None:
            await self.send_json({"type": WSEvent.ERROR, "detail": "Unknown event type"})
            return
        await handler(self, content)

    # --- Outbound: one line per event, delegating to the owning module ---

    async def chat_message(self, event):
        await chat.push_message(self, event)

    async def feed_update(self, event):
        await feed.push_update(self, event)

    async def notification_message(self, event):
        await self.send_json({"type": WSEvent.NOTIFICATION, "notification": event["notification"]})

    async def presence_update(self, event):
        await self.send_json({"type": WSEvent.PRESENCE_UPDATE, "data": event["data"]})
```

## Backend: handler modules

Each feature owns its own file. The consumer never imports feature logic
directly — only the registry.

```python
# apps/realtime/handlers/chat.py
from channels.db import database_sync_to_async
from apps.realtime.models import ChatRoom, ChatMessage
from apps.realtime.event_types import WSEvent, chat_group
from apps.realtime.payloads import ChatMessageEvent

async def handle_join(consumer, content: dict):
    room_id = content["room_id"]
    if not await _user_in_room(consumer.user, room_id):
        await consumer.send_json({"type": WSEvent.ERROR, "detail": "Not a member of this room"})
        return
    await consumer.channel_layer.group_add(chat_group(room_id), consumer.channel_name)
    consumer.joined_rooms.add(room_id)

async def handle_leave(consumer, content: dict):
    room_id = content["room_id"]
    await consumer.channel_layer.group_discard(chat_group(room_id), consumer.channel_name)
    consumer.joined_rooms.discard(room_id)

async def handle_message(consumer, content: dict):
    room_id = content["room_id"]
    if room_id not in consumer.joined_rooms:
        await consumer.send_json({"type": WSEvent.ERROR, "detail": "Join the room before sending"})
        return

    message = await _save_message(room_id, consumer.user, content["content"])
    payload: ChatMessageEvent = {
        "id": str(message.id),
        "room_id": str(room_id),
        "sender_id": str(consumer.user.id),
        "content": message.content,
        "created_at": message.created_at.isoformat(),
    }
    await consumer.channel_layer.group_send(
        chat_group(room_id),
        {"type": WSEvent.CHAT_MESSAGE, "data": payload},
    )

async def push_message(consumer, event: dict):
    await consumer.send_json({"type": WSEvent.CHAT_MESSAGE, "data": event["data"]})

@database_sync_to_async
def _user_in_room(user, room_id) -> bool:
    return ChatRoom.objects.filter(id=room_id, participants=user).exists()

@database_sync_to_async
def _save_message(room_id, user, content) -> ChatMessage:
    return ChatMessage.objects.create(room_id=room_id, sender=user, content=content)
```

```python
# apps/realtime/handlers/__init__.py
from . import chat, feed
from apps.realtime.event_types import WSEvent

INBOUND_HANDLERS = {
    WSEvent.CHAT_JOIN: chat.handle_join,
    WSEvent.CHAT_LEAVE: chat.handle_leave,
    WSEvent.CHAT_MESSAGE: chat.handle_message,
    WSEvent.FEED_SUBSCRIBE: feed.handle_subscribe,
    WSEvent.FEED_UNSUBSCRIBE: feed.handle_unsubscribe,
}
```

## Backend: routing

```python
# apps/realtime/routing.py
from django.urls import re_path
from .consumers import AppSocketConsumer

websocket_urlpatterns = [
    re_path(r"ws/socket/$", AppSocketConsumer.as_asgi()),
]
```

Add a second consumer only for a genuinely different connection type:

```python
# asgi.py
application = ProtocolTypeRouter({
    "websocket": AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter([
                path("ws/socket/", AppSocketConsumer.as_asgi()),
                # path("ws/live/<uuid:event_id>/signal/", LiveSignalingConsumer.as_asgi()),
            ])
        )
    ),
})
```

---

## Frontend: typed events (discriminated union)

Define every possible incoming event as a member of a union, discriminated
by its `type` field. TypeScript then narrows the payload type automatically
based on which `type` you're handling — no `any`, no manual casting.

```ts
// types/ws-events.ts

export interface ChatMessageEvent {
  type: "chat_message";
  data: {
    id: string;
    room_id: string;
    sender_id: string;
    content: string;
    created_at: string;
  };
}

export interface FeedUpdateEvent {
  type: "feed_update";
  data: {
    post_id: string;
    topic: string;
  };
}

export interface NotificationEvent {
  type: "notification_message";
  notification: {
    id: string;
    verb: string;
    description: string;
    is_read: boolean;
    created_at: string;
  };
}

export interface PresenceUpdateEvent {
  type: "presence_update";
  data: { user_id: string; status: "online" | "offline" };
}

export interface ErrorEvent {
  type: "error";
  detail: string;
}

export type WSInboundEvent =
  | ChatMessageEvent
  | FeedUpdateEvent
  | NotificationEvent
  | PresenceUpdateEvent
  | ErrorEvent;

// Outbound (client -> server) — separate union, same idea
export type WSOutboundEvent =
  | { type: "chat_join"; room_id: string }
  | { type: "chat_leave"; room_id: string }
  | { type: "chat_message"; room_id: string; content: string }
  | { type: "feed_subscribe"; topic: string }
  | { type: "feed_unsubscribe"; topic: string };
```

## Frontend: socket service (typed)

```ts
// lib/socket-service.ts
import type { WSInboundEvent, WSOutboundEvent } from "@/types/ws-events";

type Handler<T> = (payload: T) => void;

class SocketService {
  private ws: WebSocket | null = null;
  private listeners = new Map<string, Set<Handler<any>>>();
  private reconnectAttempts = 0;

  constructor(private url: string) {}

  connect() {
    if (this.ws && this.ws.readyState !== WebSocket.CLOSED) return;

    this.ws = new WebSocket(this.url);
    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (e) => {
      const parsed: WSInboundEvent = JSON.parse(e.data);
      this.listeners.get(parsed.type)?.forEach((handler) => handler(parsed));
    };

    this.ws.onclose = (e) => {
      if (e.code !== 1000) this.scheduleReconnect();
    };
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

  send(event: WSOutboundEvent) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(event));
    }
  }

  on<T extends WSInboundEvent["type"]>(
    type: T,
    handler: Handler<Extract<WSInboundEvent, { type: T }>>,
  ) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(handler);
    return () => this.listeners.get(type)?.delete(handler);
  }
}

export const socketService = new SocketService(
  "ws://localhost:8000/ws/socket/",
);
```

`on()`'s generic signature is the key part: calling
`socketService.on("chat_message", (payload) => ...)` gives you a `payload`
typed exactly as `ChatMessageEvent`, not the whole union — TypeScript narrows
it from the string literal you passed in.

## Frontend: typed hook

```ts
// hooks/use-socket-event.ts
import { useEffect } from "react";
import { socketService } from "@/lib/socket-service";
import type { WSInboundEvent } from "@/types/ws-events";

export function useSocketEvent<T extends WSInboundEvent["type"]>(
  type: T,
  handler: (payload: Extract<WSInboundEvent, { type: T }>) => void,
) {
  useEffect(() => socketService.on(type, handler), [type, handler]);
}
```

Usage — fully typed, no casting, autocomplete on `payload.data.*`:

```tsx
useSocketEvent("chat_message", (payload) => {
  console.log(payload.data.content); // typed as string, no `any`
});

socketService.send({ type: "chat_message", room_id, content: "hi" }); // typo in `type` is a compile error
```

## Frontend: connection lifecycle

```tsx
// providers/socket-provider.tsx
import { useEffect } from "react";
import { useSession } from "@/features/auth/hooks";
import { socketService } from "@/lib/socket-service";

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { data } = useSession();
  const isAuthenticated = data?.meta?.is_authenticated;

  useEffect(() => {
    if (isAuthenticated) socketService.connect();
    else socketService.disconnect();
  }, [isAuthenticated]);

  return <>{children}</>;
}
```

---

## Decision rule for adding a new consumer

Ask: **does this need a different transport, protocol, or audience — not
just different data?**

| Situation                                                  | New consumer?                                     |
| ---------------------------------------------------------- | ------------------------------------------------- |
| Chat, notifications, feed, presence for the logged-in user | No — new event + handler module                   |
| Live club-join announcement, event participant count       | No — same as above                                |
| WebRTC signaling for live streaming                        | Yes — different protocol/lifecycle                |
| Public unauthenticated live-viewer count                   | Yes — different auth model                        |
| Telegram bot / non-WebSocket protocol integration          | Yes — different `ProtocolTypeRouter` key entirely |

## Checklist when adding a new real-time feature

1. Add the event name to `event_types.py` (`WSEvent`) — never a raw string elsewhere.
2. Add a group-naming helper if it's a new topic shape.
3. Add the payload shape to `payloads.py`.
4. Create or extend a `handlers/<feature>.py` module.
5. Register inbound types in `INBOUND_HANDLERS`.
6. Add a one-line outbound method on the consumer if it's a new event _type_
   (not needed if reusing an existing outbound type).
7. Mirror the event in `types/ws-events.ts` (both inbound and outbound
   unions).
8. Subscribe from the relevant component via `useSocketEvent`.
