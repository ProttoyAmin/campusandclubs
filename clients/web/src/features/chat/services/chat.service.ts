import { chatHttp, type ChatStartDTO } from "../http/chat.http";


class ChatService {
    chatClient = chatHttp;

    list() {
        return this.chatClient.getChatList();
    }

    start(data: ChatStartDTO) {
        return this.chatClient.getChatStart(data);
    }

    message(chatId: string, data: { content: string }) {
        return this.chatClient.sendMessage(chatId, data);
    }

    async messages(chatId: string) {
        const results = await this.chatClient.getChatInbox(chatId);
        return results
    }

}

export const chat = new ChatService();