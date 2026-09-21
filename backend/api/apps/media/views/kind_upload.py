"""Kind-based media upload endpoint.

``POST /api/v1/media/kind/`` accepts a ``kind`` path/form parameter and
routes the upload to the correct target model, applying the right
authorization and default ``role``. This is the primary frontend-facing
upload endpoint; the older generic endpoint (``/media/`` with
``target_type``+``object_id``) is preserved for admin/internal use.

Supported kinds
---------------
============  ==========  =================  ===============================
kind          target id   default role       who can upload
============  ==========  =================  ===============================
user          optional    avatar             self (no id => current user)
club          required    avatar             club owner or admin
message       required    attachment         message sender
post          required    gallery            post author
============  ==========  =================  ===============================

The caller may override ``role`` with any role value valid for that model
(e.g. ``cover`` for users, ``logo``/``banner`` for clubs, ``attachment``
for posts). ``file`` may be a single file or a list.
"""
from __future__ import annotations

from django.db import transaction
from rest_framework import permissions, serializers, status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import User
from apps.clubs.models import Club, Membership
from apps.media.models import MediaRole
from apps.media.repositories import MediaRepository
from apps.media.serializers import MediaListSerializer
from apps.posts.models import Post
from apps.realtime.models import Message


# (model_class, default_role) per kind.
_KIND_MAP = {
    "user": (User, MediaRole.AVATAR),
    "club": (Club, MediaRole.AVATAR),
    "message": (Message, MediaRole.ATTACHMENT),
    "post": (Post, MediaRole.GALLERY),
}


class KindMediaUploadSerializer(serializers.Serializer):
    kind = serializers.ChoiceField(choices=list(_KIND_MAP.keys()))
    id = serializers.UUIDField(required=False, allow_null=False)
    role = serializers.ChoiceField(choices=MediaRole.choices, required=False)
    file = serializers.ListField(
        child=serializers.FileField(allow_empty_file=False, use_url=False),
        required=False,
        write_only=True,
    )
    single_file = serializers.FileField(
        allow_empty_file=False, use_url=False, required=False, write_only=True,
    )

    def validate(self, attrs):
        kind = attrs["kind"]
        if kind == "user" and "id" not in attrs:
            attrs["id"] = self.context["request"].user.id
        if "id" not in attrs:
            raise ValidationError({"id": "This field is required."})
        files = list(attrs.get("file") or [])
        if attrs.get("single_file"):
            files.append(attrs["single_file"])
        if not files:
            raise ValidationError({"file": "At least one file is required."})
        attrs["_files"] = files
        return attrs


class KindMediaUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = KindMediaUploadSerializer

    def post(self, request, *args, **kwargs):
        sz = KindMediaUploadSerializer(data=request.data, context={"request": request})
        sz.is_valid(raise_exception=True)
        data = sz.validated_data
        kind = data["kind"]
        target_id = data["id"]
        model_class, default_role = _KIND_MAP[kind]
        role = data.get("role") or default_role

        # Fetch target & authorize.
        try:
            target = model_class.objects.get(pk=target_id)
        except model_class.DoesNotExist:
            raise ValidationError({"id": f"No {kind} found with this id."})

        self._authorize(request.user, kind, target)

        files = data["_files"]
        repo = MediaRepository()
        with transaction.atomic():
            created = repo.attach_files(obj=target, files=files, role=role)

        output = MediaListSerializer(created, many=True, context={"request": request}).data
        if len(created) == 1:
            return Response(output[0], status=status.HTTP_201_CREATED)
        return Response(output, status=status.HTTP_201_CREATED)

    # ------------------------------------------------------------------ #
    # Authorization
    # ------------------------------------------------------------------ #
    @staticmethod
    def _authorize(user, kind: str, target) -> None:
        if kind == "user":
            if target.id != user.id:
                
                raise PermissionDenied("You can only upload media for your own profile.")
            return

        if kind == "club":
            is_owner = getattr(target, "owner_id", None) == user.id
            is_member = Membership.objects.filter(club=target, user=user).exists()
            if not (is_owner or is_member):
                
                raise PermissionDenied("Only club members can change club media.")
            return

        if kind == "message":
            if getattr(target, "sender_id", None) != user.id:
                
                raise PermissionDenied("You can only attach files to your own messages.")
            return

        if kind == "post":
            if getattr(target, "author_id", None) != user.id:
                
                raise PermissionDenied("You can only attach files to your own posts.")
            return
