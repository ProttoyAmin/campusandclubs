# apps/realtime/views.py
from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.db import transaction
from apps.realtime.models import ChatRoom, ChatMessage
from apps.realtime.serializers import ChatRoomSerializer, ChatMessageSerializer, ChatRoomCreateSerializer, ChatRoomStartSerializer

User = get_user_model()

class ChatRoomListView(generics.ListAPIView):
    """Rooms the current user belongs to."""
    serializer_class = ChatRoomSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ChatRoom.objects.filter(participants=self.request.user)

class ChatRoomCreateView(APIView):
    """Start (or return existing) DM room with another user."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChatRoomCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        other_user = get_object_or_404(User, id=serializer.validated_data["participant_id"])

        existing = (
            ChatRoom.objects.filter(club__isnull=True, participants=request.user)
            .filter(participants=other_user)
            .first()
        )
        if existing:
            return Response(ChatRoomSerializer(existing).data)

        room = ChatRoom.objects.create()
        room.participants.add(request.user, other_user)
        return Response(ChatRoomSerializer(room).data, status=201)

class ChatMessageListView(generics.ListAPIView):
    """Paginated message history for a room — verifies membership."""
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        room = get_object_or_404(ChatRoom, id=self.kwargs["room_id"], participants=self.request.user)
        return room.messages.order_by("-created_at")

class ChatRoomStartView(APIView):
    """Get-or-create a DM room AND send the first message, atomically."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChatRoomStartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        other_user = get_object_or_404(User, id=serializer.validated_data["participant_id"])

        if other_user == request.user:
            return Response({"detail": "Cannot start a room with yourself."}, status=400)

        with transaction.atomic():
            room = (
                ChatRoom.objects.filter(club__isnull=True, participants=request.user)
                .filter(participants=other_user)
                .first()
            )
            is_new = room is None
            if is_new:
                room = ChatRoom.objects.create()
                room.participants.add(request.user, other_user)

            message = ChatMessage.objects.create(
                room=room, sender=request.user, content=serializer.validated_data["content"]
            )

        # Fan out over WebSocket so the other user's inbox updates live
        from asgiref.sync import async_to_sync
        from channels.layers import get_channel_layer

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"chat_{room.id}",
            {
                "type": "chat_message",
                "data": ChatMessageSerializer(message).data,
            },
        )

        return Response(
            {
                "room": ChatRoomSerializer(room).data,
                "message": ChatMessageSerializer(message).data,
                "created": is_new,
            },
            status=201 if is_new else 200,
        )