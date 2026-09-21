import { BaseClient } from "@/settings/api";
import { config } from "@/settings/app/config";
import type { UserMinimal } from "@campus/api";
import type { AxiosResponse } from "axios";

// ─────────────────────────────────────────────────────────────────────
// Types — wire shapes returned by /api/v1/realtime
//
// NOTE: We keep the original `ChatResponse` + `Message` names around so
// existing components that import them don't break, but we extend them
// with the new fields the refactored backend returns (msg_type,
// attachments, reactions, my_status, deleted_mode, unread_count, …).
// ─────────────────────────────────────────────────────────────────────

export interface ChatParticipant extends UserMinimal {}

export interface MessageAttachment {
  id: string;
  kind: "image" | "video" | "audio" | "file";
  file_url: string;
  thumb_url?: string | null;
  file_name?: string | null;
  mime_type?: string | null;
  size_bytes?: number | null;
  width?: number | null;
  height?: number | null;
  duration_ms?: number | null;
  media_id?: string | null;
}

export type MessageStatus = "sent" | "delivered" | "seen";

export interface Message {
  id: string;
  chat: string;
  sender: UserMinimal;
  content: string | null;
  msg_type: "TEXT" | "IMAGE" | "VIDEO" | "FILE" | "VOICE" | "STICKER" | "SYSTEM" | "LOCATION";
  client_msg_id?: string | null;
  reply_to: null | {
    id: string;
    sender: UserMinimal;
    content: string | null;
    created_at: string;
  };
  attachments: MessageAttachment[];
  is_pinned: boolean;
  reactions: Record<string, UserMinimal[]>;
  my_status: MessageStatus | null;
  created_at: string;
  edited_at: string | null;
  deleted_mode: "NONE" | "FOR_ME" | "FOR_EVERYONE";
  is_tombstone?: boolean;
}

export interface ChatResponse {
  id: string;
  type: "DIRECT" | "GROUP" | "CLUB";
  name?: string | null;
  avatar?: string | null;
  description?: string | null;
  club: string | null;
  is_pinned: boolean;
  last_message_at: string | null;
  participants: ChatParticipant[];
  created_at: string;
  updated_at: string;
  last_message: Message | null;
  unread_count: number;
}

export interface MessageRequestDTO {
  id: string;
  chat_id: string | null;
  from_user: UserMinimal;
  content: string;
  status: "pending" | "accepted" | "declined";
  created_at: string;
}

// ─────────────────────────────────────────────────────────────────────
// Write DTOs
// ─────────────────────────────────────────────────────────────────────

export interface ChatStartDTO {
  participant_ids: string[];
  content: string;
  name?: string;
  client_msg_id?: string;
}

export interface MessageSendDTO {
  content: string;
  reply_to?: string;
  msg_type?: Message["msg_type"];
  client_msg_id?: string;
  attachments?: Array<{ file_url: string; kind: MessageAttachment["kind"] }>;
}

// ─────────────────────────────────────────────────────────────────────
// API envelope returned by core.response.ApiResponse
// ─────────────────────────────────────────────────────────────────────
export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

class ChatHttp extends BaseClient<ChatResponse, any, any> {
  constructor() {
    super(config.api.v1.realtime.base);
  }

  // ── Chats ────────────────────────────────────────────────────────
  async getChatList(): Promise<ApiEnvelope<ChatResponse[]>> {
    const response = await this.client.get<ApiEnvelope<ChatResponse[]>>(`${this.endpoint}chats/`);
    return response.data;
  }

  async startDirect(participantId: string) {
    const response = await this.client.post<ApiEnvelope<ChatResponse>>(
      `${this.endpoint}chats/start-dm/`,
      { participant_id: participantId },
    );
    return response.data;
  }

  async getChatStart(data: ChatStartDTO): Promise<ApiEnvelope<{ chat: ChatResponse; message: Message; created: boolean }>> {
    const response = await this.client.post(`${this.endpoint}chats/start/`, data);
    return response.data;
  }

  async createGroup(data: { name: string; participant_ids: string[]; description?: string }) {
    const response = await this.client.post<ApiEnvelope<ChatResponse>>(`${this.endpoint}chats/group/`, data);
    return response.data;
  }

  // ── Requests ─────────────────────────────────────────────────────
  async getPendingChat(): Promise<ApiEnvelope<MessageRequestDTO[]>> {
    const response = await this.client.get<ApiEnvelope<MessageRequestDTO[]>>(`${this.endpoint}chats/requests/`);
    return response.data;
  }

  async acceptChat(chatId: string): Promise<ApiEnvelope<ChatResponse>> {
    const response = await this.client.post<ApiEnvelope<ChatResponse>>(`${this.endpoint}chats/${chatId}/accept/`);
    return response.data;
  }

  async declineChat(chatId: string): Promise<void> {
    await this.client.post(`${this.endpoint}chats/${chatId}/decline/`);
  }

  // ── Messages ─────────────────────────────────────────────────────
  async getChatInbox(chatId: string, params?: { cursor?: string; before?: boolean; limit?: number }) {
    const response = await this.client.get<ApiEnvelope<Message[]>>(
      `${this.endpoint}chats/${chatId}/messages/`,
      { params },
    );
    return response.data;
  }

  async sendMessage(chatId: string, data: MessageSendDTO): Promise<ApiEnvelope<Message>> {
    const response = await this.client.post(`${this.endpoint}chats/${chatId}/messages/send/`, data);
    return response.data;
  }

  /** Send a message with file attachments (multipart) in one request.
   *  Files are uploaded straight to Cloudinary by the server. */
  async uploadMessage(chatId: string, payload: {
    content: string;
    reply_to?: string;
    msg_type?: Message["msg_type"];
    client_msg_id?: string;
    files?: File[];
  }): Promise<ApiEnvelope<Message>> {
    const form = new FormData();
    if (payload.content) form.append("content", payload.content);
    if (payload.reply_to) form.append("reply_to", payload.reply_to);
    if (payload.msg_type) form.append("msg_type", payload.msg_type);
    if (payload.client_msg_id) form.append("client_msg_id", payload.client_msg_id);
    (payload.files ?? []).forEach((f) => form.append("attachments", f));
    const response = await this.client.post(`${this.endpoint}chats/${chatId}/messages/upload/`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  }

  async editMessage(messageId: string, content: string): Promise<ApiEnvelope<Message>> {
    const response = await this.client.patch(`${this.endpoint}messages/${messageId}/`, { content });
    return response.data;
  }

  async deleteMessage(messageId: string, mode: "FOR_ME" | "FOR_EVERYONE" = "FOR_ME") {
    const response = await this.client.post(`${this.endpoint}messages/${messageId}/delete/`, { mode });
    return response.data;
  }

  async react(messageId: string, emoji: string): Promise<ApiEnvelope<{ message_id: string; chat_id: string; user_id: string; emoji: string; added: boolean }>> {
    const response = await this.client.post(`${this.endpoint}messages/reactions/`, { message_id: messageId, emoji });
    return response.data;
  }

  async markSeen(chatId: string, messageId: string): Promise<void> {
    await this.client.post(`${this.endpoint}chats/${chatId}/messages/seen/`, { message_id: messageId });
  }
}

export const chatHttp = new ChatHttp();
