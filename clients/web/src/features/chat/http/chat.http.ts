import { BaseClient } from "@/settings/api";
import { config } from "@/settings/app/config";
import type { UserMinimal } from "@campus/api";
import type { AxiosResponse } from "axios";

export type ChatResponse = {
    id: string
    type: string;
    participants: Array<{
        id: string
        username: string
        email: string
        avatar: string
        professional_email: any
        profile_picture: any
    }>
    created_at: string
    last_message: {
        id: string
        room: string
        sender: string
        sender_username: string
        content: string
        created_at: string
    }
}

export type Message = {
    id: string
    chat: string
    sender: UserMinimal;
    content: string
    reply_to: string | null;
    created_at: string
    edited_at: string | null
}

export type ChatStartDTO = {
    participant_ids: string[];
    content: string
}

class ChatHttp extends BaseClient<ChatResponse, any, any> {
    constructor() {
        super(config.api.v1.realtime.base)
    }

    async getChatList(): Promise<AxiosResponse<ChatResponse[]>> {
        const response = await this.client.get<ChatResponse[]>(`${this.endpoint}chats/`);
        return response;
    }

    async getChatStart(data: ChatStartDTO) {
        const response = await this.client.post(`${this.endpoint}chats/start/`, data);
        return response;
    }

    async sendMessage(chatId: string, data: { content: string }) {
        const response = await this.client.post(`${this.endpoint}chats/${chatId}/messages/send/`, data);
        return response;
    }

    async getChatInbox(chatId: string) {
        const response = await this.client.get<Message[]>(`${this.endpoint}chats/${chatId}/messages/`);
        return response.data;
    }
}

export const chatHttp = new ChatHttp();