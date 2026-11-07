from __future__ import annotations

from rest_framework import serializers


class ProviderTokenSerializer(serializers.Serializer):
    provider = serializers.CharField()
    token = serializers.DictField(child=serializers.CharField(), allow_empty=False)

class DisconnectProviderSerializer(serializers.Serializer):
    provider = serializers.CharField()
    account = serializers.CharField()