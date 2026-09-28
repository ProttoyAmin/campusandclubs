# # apps/notifications/signals.py
from __future__ import annotations
from apps.accounts.serialize.user.profile import UserMinimalSerializer




from typing import Type, Any
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import json
from apps.connections.models import Follow, FollowStatus
from apps.interactions.models import Like, Comment
from .models import Notification, NotificationActor, NotificationDelivery
from apps.posts.models import Post
from apps.accounts.models import User


from .models.enums import NotificationVerb, NotificationStatus, NotificationChannel

from apps.realtime.broadcast import broadcast_to_user_sync
from apps.realtime.events import WSEvent, ChannelsHandler

# @receiver(post_save, sender=Follow)
# def create_follow_notification(sender, instance, created, **kwargs):
#     """
#     Create a notification when a follow relationship is created or updated.

#     - If created with status 'pending': Create a 'follow_request' notification
#     - If created with status 'accepted': Create a 'follow_accept' notification (direct follow)
#     - If updated from 'pending' to 'accepted': Create a 'follow_accept' notification
#     """
#     if created:
#         # New follow created
#         if instance.status == 'pending':
#             # Follow request sent to a private account
#             _create_follow_request_notification(instance)
#         elif instance.status == 'accepted':
#             # Direct follow (public account) - notify the user being followed
#             _create_new_follower_notification(instance)
#     else:
#         # Follow updated - check if status changed to accepted
#         if instance.status == 'accepted':
#             # Follow request was accepted - notify the requester
#             _create_follow_accepted_notification(instance)

class NotificationSignalHandlers:
    
    @staticmethod
    @receiver(post_save, sender=Follow)
    def handle_follow_creation(sender: Type[Follow], instance: Follow, created: bool, **kwargs: dict[str, Any]) -> None:
        if created:
            
            if instance.status == FollowStatus.PENDING:
                # sending follow request to a private account
                NotificationSignalHandlers._create_follow_request_notification(instance)
                return
            
            if instance.status == FollowStatus.ACCEPTED:
                # Direct follow (public account) - notify the user being followed
                NotificationSignalHandlers._create_new_follower_notification(instance)
                return
        else:
            if instance.status == FollowStatus.ACCEPTED:
                NotificationSignalHandlers._create_follow_accepted_notification(instance)
                return

    @staticmethod
    @receiver(post_delete, sender=Follow)
    def handle_follow_deletion(sender: Type[Follow], instance: Follow, **kwargs: dict[str, Any]) -> None:
        notification = Notification.objects.filter(
            verb=NotificationVerb.FOLLOW_REQUEST,
            target_ct=ContentType.objects.get_for_model(instance),
            target_id=instance.id
        ).first()

        if notification is None:
            # not found follow
            return


        NotificationActor.objects.filter(
            notification=notification,
            actor=instance.follower
        ).delete()


        NotificationDelivery.objects.filter(
            notification=notification,
            channel=NotificationChannel.IN_APP,
            status=NotificationStatus.DELIVERED
        ).delete()

        notification.delete()
            


    @staticmethod
    @receiver(post_save, sender=Like)
    def handle_like_creation(sender: Type[Like], instance: Like, created: bool, **kwargs: dict[str, Any]) -> None:
        if not created:
            return

        liker: User = instance.user
        liked_object = instance.content_object

        if liked_object is None:
            return

        if isinstance(liked_object, Post):
            post_owner: User = liked_object.author

            if liker.id == post_owner.id:
                return

            NotificationSignalHandlers._create_post_like_notification(instance, liker, liked_object)


        # for now just return
        return

    @staticmethod
    @receiver(post_delete, sender=Like)
    def handle_like_deletion(sender: Type[Like], instance: Like, **kwargs: dict[str, Any]) -> None:

        liker: User = instance.user
        liked_object = instance.content_object

        if liked_object is None:
            return

        if isinstance(liked_object, Post):
            post_owner: User = liked_object.author

            if liker.id == post_owner.id:
                return

            NotificationSignalHandlers._delete_post_like_notification(instance, liker, liked_object)


        # for now just return
        return


    @staticmethod
    def _create_follow_request_notification(follow: Follow) -> Notification:

        follower: User = follow.follower
        following: User = follow.following

        notification = Notification.objects.create(
            recipient=following,
            target_ct=ContentType.objects.get_for_model(follow),
            target_id=follow.id,
            verb=NotificationVerb.FOLLOW_REQUEST,
            description=f'sent you a follow request.'
        )

        NotificationActor.objects.create(
            notification=notification,
            actor=follower
        )

        NotificationDelivery.objects.create(
            notification=notification,
            channel=NotificationChannel.IN_APP,
            status=NotificationStatus.DELIVERED
        )

        NotificationSignalHandlers._send_websocket_event(notification)

        return notification

    @staticmethod
    def _send_websocket_event(notification: Notification):
        """
        Send WebSocket event to the notification recipient
        """
        actor: User = notification.actors.first().actor

        broadcast_to_user_sync(
            user_id=notification.recipient.id,
            event_type=ChannelsHandler.NOTIFICATION_CREATED,
            data={
                "id": notification.id,
                "content": notification.description,
                "actor": UserMinimalSerializer(actor).data,
                "created_at": notification.created_at.isoformat(),
            }
        )

    @staticmethod
    def _create_new_follower_notification(follow: Follow) -> Notification:
        pass

    @staticmethod
    def _create_follow_accepted_notification(follow: Follow) -> Notification:
        pass

    @staticmethod
    def _create_post_like_notification(instance: Like, liker: User, post_object: Post) -> Notification:

        notification = Notification.objects.create(
            recipient=post_object.author,
            target_ct=ContentType.objects.get_for_model(instance.content_object),
            target_id=instance.content_object.id,
            verb=NotificationVerb.LIKE,
            description=f'liked your post.'
        )

        NotificationActor.objects.create(
            notification=notification,
            actor=liker
        )

        NotificationDelivery.objects.create(
            notification=notification,
            channel=NotificationChannel.IN_APP,
            status=NotificationStatus.DELIVERED
        )

        NotificationSignalHandlers._send_websocket_event(notification)

        return notification


    @staticmethod
    def _delete_post_like_notification(instance: Like, liker: User, post_object: Post) -> Notification:
        notification = Notification.objects.filter(
            recipient=post_object.author,
            target_ct=ContentType.objects.get_for_model(instance.content_object),
            target_id=instance.content_object.id,
            verb=NotificationVerb.LIKE,
        ).first()

        if notification is None:
            return

        NotificationActor.objects.filter(
            notification=notification,
            actor=liker
        ).delete()

        NotificationDelivery.objects.filter(
            notification=notification,
            channel=NotificationChannel.IN_APP,
            status=NotificationStatus.DELIVERED
        ).delete()

        notification.delete()

        return notification

#     # Send real-time notification via WebSocket
#     _send_websocket_notification(notification, post_owner, target_object)

#     return notification


# def _create_follow_accepted_notification(follow):
#     """Create notification when a follow request is accepted"""
#     # Notify the original requester that their request was accepted
#     notification = Notification.objects.create(
#         recipient=follow.follower,
#         verb='follow_accept',
#         description=f'{follow.following.username} accepted your follow request.'
#     )

#     # Add the person who accepted as the actor
#     NotificationActor.objects.create(
#         notification=notification,
#         actor=follow.following
#     )

#     # Add the follow as the target
#     NotificationTarget.objects.create(
#         notification=notification,
#         content_type=ContentType.objects.get_for_model(Follow),
#         object_id=follow.id
#     )

#     # Create in-app delivery record
#     NotificationDelivery.objects.create(
#         notification=notification,
#         channel='in_app',
#         status='delivered'
#     )

#     # Send real-time notification via WebSocket
#     _send_websocket_notification(notification, follow.follower)

#     return notification

# def _create_follow_request_notification(follow):
#     """Create notification for a new follow request (pending status)"""
#     # Notify the user being followed that they have a new follow request
#     notification = Notification.objects.create(
#         recipient=follow.following,
#         verb='follow_request',
#         description=f'{follow.follower.username} requested to follow you.'
#     )

#     # Add the follower as the actor
#     NotificationActor.objects.create(
#         notification=notification,
#         actor=follow.follower
#     )

#     # Add the follow as the target
#     NotificationTarget.objects.create(
#         notification=notification,
#         content_type=ContentType.objects.get_for_model(Follow),
#         object_id=follow.id
#     )

#     # Create in-app delivery record
#     NotificationDelivery.objects.create(
#         notification=notification,
#         channel='in_app',
#         status='delivered'
#     )

#     # Send real-time notification via WebSocket
#     _send_websocket_notification(notification, follow.following)

#     return notification


# def _create_new_follower_notification(follow):
#     """Create notification when someone directly follows you (public account)"""
#     # Notify the user being followed
#     notification = Notification.objects.create(
#         recipient=follow.following,
#         verb='follow_accept',  # Using follow_accept as the verb for "started following"
#         description=f'{follow.follower.username} started following you.'
#     )

#     # Add the follower as the actor
#     NotificationActor.objects.create(
#         notification=notification,
#         actor=follow.follower
#     )

#     # Add the follow as the target
#     NotificationTarget.objects.create(
#         notification=notification,
#         content_type=ContentType.objects.get_for_model(Follow),
#         object_id=follow.id
#     )

#     # Create in-app delivery record
#     NotificationDelivery.objects.create(
#         notification=notification,
#         channel='in_app',
#         status='delivered'
#     )

#     # Send real-time notification via WebSocket
#     _send_websocket_notification(notification, follow.following)

#     return notification


# def _create_follow_accepted_notification(follow):
#     """Create notification when a follow request is accepted"""
#     # Notify the original requester that their request was accepted
#     notification = Notification.objects.create(
#         recipient=follow.follower,
#         verb='follow_accept',
#         description=f'{follow.following.username} accepted your follow request.'
#     )

#     # Add the person who accepted as the actor
#     NotificationActor.objects.create(
#         notification=notification,
#         actor=follow.following
#     )

#     # Add the follow as the target
#     NotificationTarget.objects.create(
#         notification=notification,
#         content_type=ContentType.objects.get_for_model(Follow),
#         object_id=follow.id
#     )

#     # Create in-app delivery record
#     NotificationDelivery.objects.create(
#         notification=notification,
#         channel='in_app',
#         status='delivered'
#     )

#     # Send real-time notification via WebSocket
#     _send_websocket_notification(notification, follow.follower)

#     return notification


# def _send_websocket_notification(notification, recipient, target=None):
#     """
#     Send a real-time notification via WebSocket.
#     This will push the notification to the user's notification channel.
#     """
#     try:
#         channel_layer = get_channel_layer()
#         if channel_layer is None:
#             return

#         # Get primary actor info
#         primary_actor = notification.actors.first()
#         actor_data = None
#         target_data = None
#         if primary_actor:
#             actor_data = {
#                 'id': str(primary_actor.actor.id),
#                 'username': primary_actor.actor.username,
#                 'first_name': primary_actor.actor.first_name,
#                 'last_name': primary_actor.actor.last_name,
#                 'avatar': str(primary_actor.actor.avatar) if getattr(primary_actor.actor, 'avatar', None) else None,
#             }

#         if target:
#             target_id = target.get('id') if isinstance(target, dict) else getattr(target, 'id', None)
#             target_data = {
#                 'id': str(target_id) if target_id is not None else None,
#             }

#         # Prepare notification data
#         notification_data = {
#             'type': 'notification_message',
#             'notification': {
#                 'id': str(notification.id),
#                 'verb': notification.verb,
#                 'description': notification.description,
#                 'is_read': notification.is_read,
#                 'is_seen': notification.is_seen,
#                 'primary_actor': actor_data,
#                 'actor_count': notification.actors.count(),
#                 'target': target_data,
#                 'created_at': notification.created_at.isoformat(),
#             }
#         }

#         # Send to the recipient's personal notification channel
#         async_to_sync(channel_layer.group_send)(
#             f'notifications_{recipient.id}',
#             notification_data
#         )
#     except Exception as e:
#         # Log the error but don't fail the signal
#         print(f"Failed to send WebSocket notification: {e}")


# @receiver(post_save, sender=Like)
# def create_like_notification(sender, instance, created, **kwargs):
#     """
#     Create a notification when a Like is created.
#     Notify the owner of the post that someone liked their post.
#     """
#     if not created:
#         return None

#     liker = instance.user

#     # Get the liked content using GenericForeignKey
#     liked_content = instance.content_object

#     if liked_content is None:
#         return None

#     # Check if the liked content is a Post (has an author attribute)
#     if not hasattr(liked_content, 'author'):
#         return None

#     post_owner = liked_content.author
#     target_object = instance.content_object

#     # Don't notify if user liked their own post
#     if liker == post_owner:
#         return None

#     # Create notification
#     notification = Notification.objects.create(
#         recipient=post_owner,
#         verb='like',
#         description=f'{liker.username} liked your post.'
#     )

#     # Add the liker as the actor
#     NotificationActor.objects.create(
#         notification=notification,
#         actor=liker
#     )

#     # Add the like as the target
#     NotificationTarget.objects.create(
#         notification=notification,
#         content_type=ContentType.objects.get_for_model(Like),
#         object_id=instance.id
#     )

#     # Create in-app delivery record
#     NotificationDelivery.objects.create(
#         notification=notification,
#         channel='in_app',
#         status='delivered'
#     )

#     # Send real-time notification via WebSocket
#     _send_websocket_notification(notification, post_owner, target_object)

#     return notification
