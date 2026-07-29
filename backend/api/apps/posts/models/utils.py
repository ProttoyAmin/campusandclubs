import os

def post_image_upload_path(instance, filename):
    """Generate upload path for post images"""
    ext = filename.split('.')[-1]
    # Handle both Post and PostMedia instances
    post_id = instance.id if hasattr(instance, 'post') and instance.post is None else (
        instance.post.id if hasattr(instance, 'post') else instance.id)
    filename = f"{post_id}_image_{instance.order if hasattr(instance, 'order') else 0}.{ext}"
    return os.path.join('posts', 'images', filename)


def post_video_upload_path(instance, filename):
    """Generate upload path for post videos"""
    ext = filename.split('.')[-1]
    # Handle both Post and PostMedia instances
    post_id = instance.id if hasattr(instance, 'post') and instance.post is None else (
        instance.post.id if hasattr(instance, 'post') else instance.id)
    filename = f"{post_id}_video_{instance.order if hasattr(instance, 'order') else 0}.{ext}"
    return os.path.join('posts', 'videos', filename)

