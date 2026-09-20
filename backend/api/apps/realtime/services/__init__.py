from ..services.chat_service import ChatService
from ..events import WSEvent

chat = ChatService()

INBOUND_HANDLERS = {
    WSEvent.CHAT_JOIN: chat.handle_chat_join,
}