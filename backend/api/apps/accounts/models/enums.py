from django.db import models

class Gender(models.TextChoices):
    MALE = "male", "Male"
    FEMALE = "female", "Female"
    OTHER = "other", "Other"

class PostVisibility(models.TextChoices):
    PUBLIC = "public", "Public"
    FOLLOWERS = "followers", "Followers Only"
    PRIVATE = "private", "Private"

class UserStatus(models.TextChoices):
    ONLINE = "online", "Online"
    AWAY = "away", "Away"
    DND = "dnd", "Do Not Disturb"

class MessageRequestChoice(models.TextChoices):
    """Who may start a new DM with this user.

    EVERYONE   – anyone can send; non-mutual follows go to the request
                 inbox, mutual follows land directly.
    FOLLOWERS  – only people who follow the user may start a conversation;
                 mutuals are auto-accepted, one-way followers land in
                 requests, strangers are blocked.
    MUTUAL     – only people the user follows back (mutual follow) may DM.
                 Auto-accepted; everyone else is blocked.
    NONE       – no new DMs are accepted at all.
    """
    EVERYONE = "everyone", "Everyone"
    FOLLOWERS = "followers", "People who follow you"
    MUTUAL = "mutual", "People you follow back"
    NONE = "none", "No one"