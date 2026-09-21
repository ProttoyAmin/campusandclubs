import { chatHttp, type ChatStartDTO, type MessageSendDTO } from "../http/chat.http";

class ChatService {
    chatClient = chatHttp;

    list() {
        return this.chatClient.getChatList();
    }

    start(data: ChatStartDTO) {
        return this.chatClient.getChatStart(data);
    }

    startDirect(participantId: string) {
        return this.chatClient.startDirect(participantId);
    }

    createGroup(data: { name: string; participant_ids: string[]; description?: string }) {
        return this.chatClient.createGroup(data);
    }

    message(chatId: string, data: MessageSendDTO) {
        return this.chatClient.sendMessage(chatId, data);
    }

    uploadMessage(chatId: string, payload: {
        content: string;
        reply_to?: string;
        files?: File[];
        client_msg_id?: string;
    }) {
        return this.chatClient.uploadMessage(chatId, payload);
    }

    messages(chatId: string, params?: { cursor?: string; before?: boolean; limit?: number }) {
        return this.chatClient.getChatInbox(chatId, params);
    }

    pending() {
        return this.chatClient.getPendingChat();
    }

    accept(chatId: string) {
        return this.chatClient.acceptChat(chatId);
    }

    decline(chatId: string) {
        return this.chatClient.declineChat(chatId);
    }

    edit(messageId: string, content: string) {
        return this.chatClient.editMessage(messageId, content);
    }

    deleteMessage(messageId: string, mode: "FOR_ME" | "FOR_EVERYONE" = "FOR_ME") {
        return this.chatClient.deleteMessage(messageId, mode);
    }

    react(messageId: string, emoji: string) {
        return this.chatClient.react(messageId, emoji);
    }

    markSeen(chatId: string, messageId: string) {
        return this.chatClient.markSeen(chatId, messageId);
    }
}

export const chat = new ChatService();
