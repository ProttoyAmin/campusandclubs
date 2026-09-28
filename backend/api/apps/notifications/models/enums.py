from django.db import models


class NotificationVerb(models.TextChoices):
    POST = 'post', 'Post'
    LIKE = 'like', 'Like'
    COMMENT = 'comment', 'Comment'
    FOLLOW_REQUEST = 'follow_request', 'Follow Request'
    FOLLOW_ACCEPT = 'follow_accept', 'Follow Accept'
    MENTION = 'mention', 'Mention'
    SHARE = 'share', 'Share'
    REPLY = 'reply', 'Reply'
    REPOST = 'repost', 'Repost'
    POST_LIKE = 'post_like', 'Post Like'
    CLUB_JOIN_REQUEST = 'club_join_request', 'Club Join Request'
    CLUB_JOIN_ACCEPT = 'club_join_accept', 'Club Join Accept'
    CLUB_JOIN_REJECT = 'club_join_reject', 'Club Join Reject'
    CLUB_INVITE = 'club_invite', 'Club Invite'
    CLUB_INVITE_ACCEPT = 'club_invite_accept', 'Club Invite Accept'
    CLUB_INVITE_REJECT = 'club_invite_reject', 'Club Invite Reject'
    CLUB_INVITE_REMOVE = 'club_invite_remove', 'Club Invite Remove'
    CLUB_INVITE_REMOVE_ACCEPT = 'club_invite_remove_accept', 'Club Invite Remove Accept'
    CLUB_INVITE_REMOVE_REJECT = 'club_invite_remove_reject', 'Club Invite Remove Reject'
    
    @classmethod
    def get_model_for_verb(cls, verb):
        """Get the model class for a given verb"""
        verb_to_model = {
            cls.POST: 'posts.Post',
            cls.LIKE: 'interactions.Like',
            cls.COMMENT: 'interactions.Comment',
            cls.FOLLOW_REQUEST: 'connections.FollowRequest',
            cls.FOLLOW_ACCEPT: 'connections.Follow',
            cls.MENTION: 'posts.Post',
            cls.SHARE: 'interactions.Share',
            cls.REPLY: 'interactions.Comment',
            cls.REPOST: 'posts.Post',
        }
        return verb_to_model.get(verb)
    


class NotificationStatus(models.TextChoices):
    PENDING = 'pending', 'Pending'
    SENT = 'sent', 'Sent'
    DELIVERED = 'delivered', 'Delivered'
    FAILED = 'failed', 'Failed'
    


class NotificationChannel(models.TextChoices):
    PUSH = 'push', 'Push Notification'
    EMAIL = 'email', 'Email'
    SMS = 'sms', 'SMS'
    IN_APP = 'in_app', 'In-App'
    WEBSOCKET = 'websocket', 'WebSocket'
    