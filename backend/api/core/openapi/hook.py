
# core/openapi_hooks.py

def include_prefix(prefix: str):   
    """
    Only include the accounts app in the generated schema.
    """
    def hook(endpoints):
        return [
            endpoint
            for endpoint in endpoints
            if endpoint[0].startswith(prefix)
        ]
    return hook


accounts_only = include_prefix("/api/v1/accounts/")
clubs_only = include_prefix("/api/v1/clubs/")
posts_only = include_prefix("/api/v1/posts/")