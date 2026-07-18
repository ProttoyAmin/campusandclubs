from django.db.models import Value
from django.db.models.functions import Lower, Replace
from django.utils.text import slugify
from rest_framework import serializers

from apps.institutes.models import Institute
from apps.clubs.models import Club

class ClubSerializer(serializers.ModelSerializer):
    """For create/update — requires name, origin, and optional fields"""
    id = serializers.CharField(read_only=True)
    origin = serializers.PrimaryKeyRelatedField(
        queryset=Institute.objects.all(),
        required=False,
        allow_null=True,
        help_text="Select an institute or leave empty for a global club."
    )
    allow_public_posts = serializers.BooleanField(
        default=False,
        help_text="Allow anyone to see posts from this club even if they are not members."
    )
    # rules = rest_serializers.CharField(
    #     required=True,
    #     help_text="Rules for the club (e.g., 'No hate speech', 'No spam', 'No harassment')"
    # )

    class Meta:
        model = Club
        fields = ['id', 'name', 'origin', 'about',
                  'avatar', 'banner', 'privacy', 'is_public', 'allow_public_posts']
        read_only_fields = ['id']

    def get_validators(self):
        """
        Remove the default UniqueTogetherValidator that DRF adds automatically
        for the UniqueConstraint in the model. We'll handle this validation ourselves.
        """
        validators = super().get_validators()
        validators = [
            v for v in validators
            if not (
                hasattr(v, 'fields') and
                set(getattr(v, 'fields', [])) == {'name', 'origin'}
            )
        ]
        return validators

    def validate(self, attrs):
        """Check for duplicate club name + origin combination (robust)"""
        name = attrs.get('name')
        origin = attrs.get('origin')

        instance = self.instance

        if name:
            # Normalize the input name for comparison
            normalized_name = name.strip().replace(" ", "").lower()

            # Check for existing clubs with same normalized name and origin
            # We use Replace to remove spaces and Lower for case-insensitivity on the DB side
            queryset = Club.objects.annotate(
                normalized_name_db=Lower(
                    Replace('name', Value(' '), Value('')))
            ).filter(
                normalized_name_db=normalized_name,
                origin=origin
            )

            if instance:
                queryset = queryset.exclude(pk=instance.pk)

            if queryset.exists():
                origin_name = origin.name if origin else "Global"
                raise serializers.ValidationError({
                    'name': f'A club with a very similar name already exists for "{origin_name}". Please choose a more distinct name.'
                })
        return attrs

    def update(self, instance, validated_data):
        """Handle Slug update on name/origin change"""
        if 'name' in validated_data or 'origin' in validated_data:
            name = validated_data.get('name', instance.name)
            origin = validated_data.get('origin', instance.origin)
            origin_str = str(origin.id) if origin else "global"
            instance.slug = slugify(f"{name.strip()}-{origin_str}")
        return super().update(instance, validated_data)

    def get_origin(self, obj):
        return obj.origin