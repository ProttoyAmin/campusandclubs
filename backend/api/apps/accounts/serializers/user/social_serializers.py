from __future__ import annotations

from rest_framework import serializers


class ProviderTokenSerializer(serializers.Serializer):
    provider = serializers.CharField()
    token = serializers.DictField(child=serializers.CharField(), allow_empty=False, required=False)
    code = serializers.CharField(required=False)
    
    def validate(self, attrs):
        if attrs.get("token") and attrs.get("code"):
            raise serializers.ValidationError("Only one of 'token' or 'code' can be provided.")
        
        if not attrs.get("token") and not attrs.get("code"):
            raise serializers.ValidationError("Either 'token' or 'code' must be provided.")
        return attrs

class DisconnectProviderSerializer(serializers.Serializer):
    provider = serializers.CharField()
    account = serializers.CharField()