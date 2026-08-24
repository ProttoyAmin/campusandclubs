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