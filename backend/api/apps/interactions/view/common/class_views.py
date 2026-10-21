from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework import status
from django.db.models import QuerySet
from rest_framework.generics import (
    RetrieveUpdateDestroyAPIView,
    CreateAPIView
)
from rest_framework.permissions import IsAuthenticated

from apps.interactions.models import Comment
from apps.interactions.serializers import CommentSerializer, CommentReplySerializer



class CommentUpdateDeleteAPIView(
    RetrieveUpdateDestroyAPIView[Comment],
    CreateAPIView[Comment]
):
    permission_classes = [IsAuthenticated]
    lookup_field = 'pk'
    lookup_url_kwarg = 'comment_id'

    def get_queryset(self) -> QuerySet[Comment]:
        return Comment.objects.all()

    def get_serializer_class(self) -> type[CommentSerializer | CommentReplySerializer]:
        if self.request.method == "POST":
            return CommentReplySerializer
        return CommentSerializer

    def update(self, request, *args, **kwargs) -> Response:
        comment = self.get_object()
        if comment.author != self.request.user:
            raise PermissionDenied("You are not authorized to update this comment")
        comment.is_edited = True
        comment.save()
        return super().update(request, *args, **kwargs)

    def create(self, request, *args, **kwargs) -> Response:

        comment = self.get_object()
        serializer = self.get_serializer_class()(data=request.data, context=self.get_serializer_context())
        serializer.is_valid(raise_exception=True)

        reply = Comment.objects.create(
            content_type=comment.content_type,
            object_id=comment.object_id,
            content=serializer.validated_data['reply'],
            author=request.user,
            parent=comment
        )

        return Response(CommentSerializer(reply, context=self.get_serializer_context()).data, status=status.HTTP_201_CREATED)


        # comment = self.get_object()

        # comment.objects.create(
        #     content=serializer.validated_data['reply'],
        #     author=request.user,
        #     parent=comment
        # )

        return Response(serializer.validated_data, status=status.HTTP_201_CREATED)
    
    

    

    
