import { chatHttp, type ChatStartDTO } from "../http/chat.http";


class ChatService {
    chatClient = chatHttp;

    list() {
        return this.chatClient.getChatList();
    }

    get(chatId: string) {
        return this.chatClient.getChatById(chatId);
    }

    start(data: ChatStartDTO) {
        return this.chatClient.getChatStart(data);
    }

    message(chatId: string, data: { content: string }) {
        return this.chatClient.sendMessage(chatId, data);
    }

    async messages(chatId: string) {
        return await this.chatClient.getChatInbox(chatId);
    }

    async pending() {
        const results = await this.chatClient.getPendingChat();
        return results
    }
}

export const chat = new ChatService();