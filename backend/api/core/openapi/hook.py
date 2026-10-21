# core/openapi_hooks.py
import os
import yaml
import allauth.headless.spec

ALLAUTH_OPENAPI_PATH = os.path.join(
    os.path.dirname(allauth.headless.spec.__file__),
    "doc",
    "openapi.yaml",
)

def merge_allauth_spec(result, generator, request, public):
    """
    Merge allauth headless's static OpenAPI spec into the DRF-generated schema.
    """
    with open(ALLAUTH_OPENAPI_PATH, "r") as f:
        allauth_spec = yaml.safe_load(f)

    result.setdefault("paths", {}).update(allauth_spec.get("paths", {}))

    allauth_components = allauth_spec.get("components", {})
    result.setdefault("components", {})
    for section in ("schemas", "responses", "parameters", "requestBodies", "securitySchemes"):
        if section in allauth_components:
            result["components"].setdefault(section, {}).update(allauth_components[section])

    return result

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


accounts_only = include_prefix("/api/accounts/")
clubs_only = include_prefix("/api/clubs/")
posts_only = include_prefix("/api/posts/")