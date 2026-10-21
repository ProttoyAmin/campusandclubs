from rest_framework.request import Request
from apps.communications.models.email.enums import EmailProvider
from rest_framework import serializers
from apps.communications.models.email.email import Email


class SendEmailSerializer(serializers.Serializer):
    receiver = serializers.EmailField(required=True)
    cc = serializers.EmailField(required=False, allow_blank=True)
    bcc = serializers.EmailField(required=False, allow_blank=True)
    subject = serializers.CharField(required=False, max_length=255, allow_blank=True)
    body = serializers.CharField(required=True)
    club_id = serializers.UUIDField(required=True)

    class Meta:
        fields = ["receiver", "cc", "bcc", "subject", "body", "club_id"]

class EmailSerializer(serializers.ModelSerializer):
    recipients = serializers.SerializerMethodField()
    class Meta:
        model = Email
        fields = ["id", "club", "sender", "recipients", "cc_recipients", "bcc_recipients", "subject", "body", "attachments", "status", "created_at", "updated_at", "sent_at"]

    def _get_request(self) -> Request:
        return self.context["request"]

    def get_recipients(self, obj: Email):
        return obj.recipients.all().values_list("email", flat=True)