
from rest_framework import serializers
from apps.posts.models import PostMedia

class PostMediaSerializer(serializers.ModelSerializer):
    """Serializer for PostMedia model"""
    media_url = serializers.ReadOnlyField()
    id = serializers.CharField()

    class Meta:
        model = PostMedia
        fields = ['id', 'media_type', 'image_file', 'video_file',
                  'image_url', 'video_url', 'media_url', 'order']
        read_only_fields = ['id']