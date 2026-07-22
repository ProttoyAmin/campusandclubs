from typing import Any


from django.urls import reverse
from rest_framework import serializers
from rest_framework.request import Request
from apps.clubs.models import MembershipApplication
from apps.clubs.models.club.club import Club

class MembershipApplicationCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a membership application.
    """
    message = serializers.CharField(required=True, allow_blank=True, allow_null=True, max_length=500)

    # url = serializers.SerializerMethodField()

    class Meta:
        visible_fields = [
            'id', 'applicant', 'club', 'status', 'reviewed_by', 'reviewed_at',
        ]
        model = MembershipApplication
        fields =  visible_fields + ["message"]
        read_only_fields = visible_fields

    def _get_request(self) -> Any:
        return self.context.get('request')

    # def get_url(self, obj: MembershipApplication):
    #     request: Request = self._get_request()
    #     assert request is not None
    #     return request.build_absolute_uri(reverse('clubs:application_detail', kwargs={'application_pk': obj.pk}))

    # def get_club(self, obj: MembershipApplication):
    #     return {
    #         "id": obj.club.id,
    #         "owner": obj.club.owner.username,
    #         "name": obj.club.name,
    #         "category": obj.club.category,
    #         "about": obj.club.about,
    #     }
        
