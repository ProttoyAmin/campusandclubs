from rest_framework import serializers



class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

class VerifyResetCodeSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=16, trim_whitespace=True)

class PasswordResetConfirmSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=16, trim_whitespace=True, required=False, allow_blank=True)
    password1 = serializers.CharField(write_only=True, trim_whitespace=False)
    password2 = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate(self, attrs):
        if attrs["password1"] != attrs["password2"]:
            raise serializers.ValidationError({"password2": "Passwords do not match."})
        return attrs