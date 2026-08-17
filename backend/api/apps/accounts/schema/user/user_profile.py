from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse

from apps.accounts.serialize.user import (
    UserProfileSerializer,
    PrivateUserSerializer,
    UserEmailSerializer,
    # UserProfileWritableSerializer,       # adjust import path/name to match yours
    # PatchedUserProfileWritableSerializer,  # adjust import path/name to match yours
)
from apps.institutes.serializers.affiliates.affiliates_serializer import (
    InstituteAffiliateForUserSerializer,
)

# ── List ──────────────────────────────────────────────────────────
list_users_schema = extend_schema(
    operation_id="list_users",
    summary="List users",
    description="Returns a paginated list of users.",
    tags=["Users"],
    parameters=[
        OpenApiParameter(name="search", type=OpenApiTypes.STR, location=OpenApiParameter.QUERY, required=False,
                          description="Search by username, first name, or last name."),
        OpenApiParameter(name="ordering", type=OpenApiTypes.STR, location=OpenApiParameter.QUERY, required=False,
                          description="Sort field, e.g. `-date_joined`, `username`."),
        OpenApiParameter(name="page", type=OpenApiTypes.INT, location=OpenApiParameter.QUERY, required=False,
                          description="Page number."),
    ],
    responses={
        200: OpenApiResponse(response=UserProfileSerializer(many=True), description="Paginated list of users."),
        401: OpenApiResponse(description="Unauthorized."),
    },
)

# ── Me ────────────────────────────────────────────────────────────
me_schema = extend_schema(
    operation_id="get_me",
    summary="Get current user profile",
    description="Returns the authenticated user's full profile.",
    tags=["Users"],
    responses={
        200: OpenApiResponse(response=UserProfileSerializer, description="Current user's profile."),
        401: OpenApiResponse(description="Unauthorized."),
    },
)

# ── Shared response blocks (safe to reuse — same shape, not same operation_id) ──
_user_lookup_responses = {
    200: OpenApiResponse(response=UserProfileSerializer, description="User profile."),
    403: OpenApiResponse(response=PrivateUserSerializer, description="Account is private — limited info returned."),
    404: OpenApiResponse(description="User not found."),
}

_user_write_responses = {
    200: OpenApiResponse(response=UserProfileSerializer, description="User updated."),
    400: OpenApiResponse(description="Validation failed."),
    403: OpenApiResponse(description="Not permitted to modify this user."),
    404: OpenApiResponse(description="User not found."),
}

# ── By ID: retrieve / update / partial_update / destroy — EACH NEEDS ITS OWN operation_id ──
_id_param = OpenApiParameter(
    name="id", type=OpenApiTypes.UUID, location=OpenApiParameter.PATH, description="User's UUID.",
)

retrieve_user_by_id_schema = extend_schema(
    operation_id="get_user_by_id",
    summary="Get user by ID",
    tags=["Users"],
    parameters=[_id_param],
    responses=_user_lookup_responses,
)

update_user_by_id_schema = extend_schema(
    operation_id="update_user_by_id",
    summary="Replace user by ID",
    tags=["Users"],
    parameters=[_id_param],
    request=UserProfileSerializer,
    responses=_user_write_responses,
)

partial_update_user_by_id_schema = extend_schema(
    operation_id="partial_update_user_by_id",
    summary="Partially update user by ID",
    tags=["Users"],
    parameters=[_id_param],
    request=UserProfileSerializer,
    responses=_user_write_responses,
)

destroy_user_by_id_schema = extend_schema(
    operation_id="delete_user_by_id",
    summary="Delete user by ID",
    tags=["Users"],
    parameters=[_id_param],
    responses={
        204: OpenApiResponse(description="User deleted."),
        403: OpenApiResponse(description="Not permitted to delete this user."),
        404: OpenApiResponse(description="User not found."),
    },
)

# ── By username: retrieve / update / partial_update / destroy — same fix ──
_username_param = OpenApiParameter(
    name="username", type=OpenApiTypes.STR, location=OpenApiParameter.PATH, description="User's username.",
)

retrieve_user_by_username_schema = extend_schema(
    operation_id="get_user_by_username",
    summary="Get user by username",
    tags=["Users"],
    parameters=[_username_param],
    responses=_user_lookup_responses,
)

update_user_by_username_schema = extend_schema(
    operation_id="update_user_by_username",
    summary="Replace user by username",
    tags=["Users"],
    parameters=[_username_param],
    request=UserProfileSerializer,
    responses=_user_write_responses,
)

partial_update_user_by_username_schema = extend_schema(
    operation_id="partial_update_user_by_username",
    summary="Partially update user by username",
    tags=["Users"],
    parameters=[_username_param],
    request=UserProfileSerializer,
    responses=_user_write_responses,
)

destroy_user_by_username_schema = extend_schema(
    operation_id="delete_user_by_username",
    summary="Delete user by username",
    tags=["Users"],
    parameters=[_username_param],
    responses={
        204: OpenApiResponse(description="User deleted."),
        403: OpenApiResponse(description="Not permitted to delete this user."),
        404: OpenApiResponse(description="User not found."),
    },
)


# ── Current-user: affiliations ─────────────────────────────────────
my_affiliations_schema = extend_schema(
    operation_id="get_my_affiliations",
    summary="List current user's institute affiliations",
    description=(
        "Returns every InstituteAffiliate row owned by the authenticated "
        "user, with the affiliated institute inlined."
    ),
    tags=["Users · Me"],
    responses={
        200: OpenApiResponse(
            response=InstituteAffiliateForUserSerializer(many=True),
            description="The authenticated user's affiliations.",
        ),
        401: OpenApiResponse(description="Unauthorized."),
    },
)


# ── Current-user: emails ────────────────────────────────────────────
my_emails_schema = extend_schema(
    operation_id="get_my_emails",
    summary="List current user's email addresses",
    description=(
        "Returns the allauth EmailAddress rows belonging to the "
        "authenticated user. Used to populate the email selector on the "
        "affiliation-claim form."
    ),
    tags=["Users · Me"],
    responses={
        200: OpenApiResponse(
            response=UserEmailSerializer(many=True),
            description="The authenticated user's emails.",
        ),
        401: OpenApiResponse(description="Unauthorized."),
    },
)