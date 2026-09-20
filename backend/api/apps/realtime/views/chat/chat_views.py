import json
from rest_framework import status
from rest_framework.request import Request
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone
from datetime import timedelta
from apps.realtime.models import Chat, Message
from apps.realtime.serializers import (
    ChatSerializer,
    MessageSerializer,
    MessageSendSerializer,
    MessageEditSerializer,
    ChatCreateSerializer,
    ChatStartSerializer,
    GroupChatCreateSerializer,
)
from ...models import ChatParticipant
from apps.realtime.models.chat.enums import ChatType
from apps.realtime.events import ChannelsHandler, chat_group

User = get_user_model()
EDIT_WINDOW = timedelta(minutes=15)


def broadcast(chat_id, event_type, data):
    """Send to a channel group. JSON-round-trips `data` so that UUID
    objects (which msgpack can't handle) become plain strings."""
    channel_layer = get_channel_layer()
    safe_data = json.loads(json.dumps(data, default=str))
    async_to_sync(channel_layer.group_send)(
        chat_group(chat_id), {"type": event_type, "data": safe_data}
    )


class ChatListView(generics.ListCreateAPIView):
    """Chats the current user belongs to. Pending DM requests are hidden
    from both sides until an accept/decline flow exists — see MessageRequest TODO."""
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        
        return (
            Chat.objects.filter(participants__user=self.request.user)
            # .exclude(
            #     type=ChatType.DIRECT,
            #     participants__status=ChatParticipant.Status.PENDING,
            # )
            .distinct()
            .order_by("-created_at")
        )
    
    def get_serializer_class(self):
        if self.request.method == "POST":
            return ChatCreateSerializer
        return ChatSerializer

    def get_serializer_context(self):
        return {"request": self.request}

    def create(self, request: Request):

        serializer = ChatCreateSerializer(data=request.data, context=self.get_serializer_context())
        serializer.is_valid(raise_exception=True)
        
        other_user = get_object_or_404(User, id=serializer.validated_data["participant_id"])
        if other_user == request.user:
            return Response({"detail": "Cannot start a chat with yourself."}, status=status.HTTP_400_BAD_REQUEST)


        existing = (
            Chat.objects.filter(club__isnull=True, participants__user=request.user)
            .filter(participants__user=other_user)
            .first()
        )
        if existing:
            return Response(ChatSerializer(existing, context={"request": request}).data)


        # with transaction.atomic():
        #     chat = Chat.objects.create(
        #         type=ChatType.DIRECT
        #     )
        #     ChatParticipant.objects.create(
        #         chat=chat, user=request.user, status=ChatParticipant.Status.ACCEPTED
        #     )
        #     ChatParticipant.objects.create(
        #         chat=chat, user=other_user, status=ChatParticipant.Status.PENDING
        #     )

            # TODO: once message-request UI exists, this chat stays invisible to both
            # users (see ChatListView) until other_user accepts.
            
        
        chat = Chat.objects.create(
                type=ChatType.DIRECT
            )
        ChatParticipant.objects.bulk_create(
                ChatParticipant(
                    chat=chat,
                    user=user,
                    status=ChatParticipant.Status.ACCEPTED
                ) for user in [request.user, other_user]
            )

        print(chat)

        return Response(ChatSerializer(chat, context={"request": request}).data, status=status.HTTP_201_CREATED)

class ChatCreateView(APIView):
    """Start (or return existing) DM room with another user."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request: Request):

        serializer = ChatCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        other_user = get_object_or_404(User, id=serializer.validated_data["participant_id"])
        if other_user == request.user:
            return Response({"detail": "Cannot start a chat with yourself."}, status=status.HTTP_400_BAD_REQUEST)


        existing = (
            Chat.objects.filter(club__isnull=True, participants=request.user)
            .filter(participants=other_user)
            .first()
        )
        if existing:
            return Response(ChatSerializer(existing, context={"request": request}).data)


        with transaction.atomic():
            chat = Chat.objects.create(
                type=ChatType.DIRECT
            )
            ChatParticipant.objects.create(
                chat=chat, user=request.user, status=ChatParticipant.Status.ACCEPTED
            )
            ChatParticipant.objects.create(
                chat=chat, user=other_user, status=ChatParticipant.Status.PENDING
            )

            # TODO: once message-request UI exists, this chat stays invisible to both
            # users (see ChatListView) until other_user accepts.
            

        return Response(ChatSerializer(chat, context={"request": request}).data, status=status.HTTP_201_CREATED)



class GroupChatCreateView(APIView):
    """Create a group chat. Creator is admin; all listed members join as ACCEPTED
    (group membership is invite-driven, not request-based)."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request: Request):
        serializer = GroupChatCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        member_ids = set(data["participant_ids"]) - {request.user.id}
        members = User.objects.filter(id__in=member_ids)

        if not members.exists():
            return Response({"detail": "Add at least one other member."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            chat = Chat.objects.create(
                type=ChatType.GROUP,
                name=data["name"],
            )

            ChatParticipant.objects.create(
                chat=chat,
                user=request.user,
                status=ChatParticipant.Status.ACCEPTED,
                is_admin=True
            )

            ChatParticipant.objects.bulk_create(
                ChatParticipant(
                    chat=chat,
                    user=member,
                    status=ChatParticipant.Status.ACCEPTED,
                )
                for member in members
            )

            return Response(
                ChatSerializer(chat, context={"request": request}).data,
                status=status.HTTP_201_CREATED,
            )


class MessageListView(generics.ListAPIView):
    """Paginated message history for a room — verifies membership."""
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        chat = get_object_or_404(
            Chat,
            id=self.kwargs["chat_id"],
            participants__user=self.request.user,
            participants__status=ChatParticipant.Status.ACCEPTED,
            )
        return chat.messages.order_by("created_at")




class MessageCreateView(APIView):
    """Send a message into an existing chat."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, chat_id):
        chat = get_object_or_404(Chat, id=chat_id)
        participant = get_object_or_404(ChatParticipant, chat=chat, user=request.user)

        if participant.status != ChatParticipant.Status.ACCEPTED:
            # PENDING side (recipient of a request they haven't accepted) can't reply yet.
            # TODO: sending here should trigger an implicit accept once that flow exists.
            return Response({"detail": "You must accept this chat before replying."}, status=403)

        serializer = MessageSendSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        reply_to = None
        if data.get("reply_to"):
            reply_to = get_object_or_404(Message, id=data["reply_to"], chat=chat)

        message = Message.objects.create(
            chat=chat, sender=request.user, content=data["content"], reply_to=reply_to
        )

        payload = MessageSerializer(message).data
        broadcast(chat.id, ChannelsHandler.CHAT_MESSAGE, payload)

        return Response(payload, status=201)


class MessageEditView(APIView):
    """Edit a message. Sender-only, within a 15-minute window."""
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, message_id):
        message = get_object_or_404(Message, id=message_id)

        if message.sender_id != request.user.id:
            return Response({"detail": "You can only edit your own messages."}, status=403)

        if timezone.now() - message.created_at > EDIT_WINDOW:
            return Response({"detail": "Edit window has expired."}, status=403)

        serializer = MessageEditSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        message.content = serializer.validated_data["content"]
        message.edited_at = timezone.now()
        message.save(update_fields=["content", "edited_at"])

        payload = MessageSerializer(message).data

        from apps.realtime.events import WSEvent
        # broadcast(message.chat_id, WSEvent.CHAT_MESSAGE_EDIT, payload)

        return Response(payload)

class ChatStartView(APIView):
    """Get-or-create a DM chat AND send the first message, atomically."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChatStartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        participant_ids = set(data["participant_ids"]) - {request.user.id}

        if not participant_ids:
            return Response({"detail": "Cannot start a chat with yourself only."}, status=status.HTTP_400_BAD_REQUEST)

        others = list(User.objects.filter(id__in=participant_ids))
        if len(others) != len(participant_ids):
            return Response({"detail": "One or more users not found."}, status=status.HTTP_404_NOT_FOUND)

        is_group = len(others) > 1

        with transaction.atomic():
            chat = None
            is_new = True

            if not is_group:
                other_user = others[0]

                chat = (
                    Chat.objects.filter(type=ChatType.DIRECT, participants__user=request.user)
                    .filter(participants__user=other_user)
                    .first()
                )
                is_new = chat is None


            if is_new:
                chat = Chat.objects.create(
                    type=ChatType.GROUP if is_group else ChatType.DIRECT,
                    name=data.get("name") or None if is_group else None,
                )
                ChatParticipant.objects.create(
                    chat=chat, user=request.user,
                    status=ChatParticipant.Status.ACCEPTED, is_admin=is_group,
                )
                for other in others:
                    ChatParticipant.objects.create(
                        chat=chat, user=other,
                        status=ChatParticipant.Status.ACCEPTED if is_group else ChatParticipant.Status.PENDING,
                    )

            message = Message.objects.create(
                chat=chat, sender=request.user, content=data["content"]
            )

        payload = MessageSerializer(message).data

        # from apps.realtime.events import WSEvent
        # broadcast(chat.id, WSEvent.CHAT_MESSAGE, payload)

        return Response(
            {
                "chat": ChatSerializer(chat, context={"request": request}).data,
                "message": payload,
                "created": is_new,
            },
            status=201 if is_new else 200,
        )