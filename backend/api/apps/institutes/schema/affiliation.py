"""
OpenAPI schema definitions for institute affiliation endpoints.

Mirrors the pattern used in apps/accounts/schema/ (separate `extend_schema`
declarations grouped by domain, imported into views via the `@schema`
decorator).
"""
from drf_spectacular.utils import (
    OpenApiResponse,
    extend_schema,
    OpenApiParameter,
    OpenApiTypes,
)

from apps.institutes.serializers.affiliates.affiliates_serializer import (
    ClaimAffiliateSerializer,
    InstituteAffiliateSerializer,
    VerifyAffiliateSerializer,
)

# ── Shared envelope for simple { message: ... } responses ──────────────
_message_response = {
    200: OpenApiResponse(
        description="Operation succeeded.",
        response={
            "type": "object",
            "properties": {
                "message": {"type": "string", "example": "Email sent successfully."}
            },
            "required": ["message"],
        },
    ),
    400: OpenApiResponse(description="Validation failed."),
    401: OpenApiResponse(description="Unauthorized."),
    404: OpenApiResponse(description="Affiliate / institute not found."),
}


# ── Claim affiliation ────────────────────────────────────────────────
claim_affiliation_schema = extend_schema(
    operation_id="claim_affiliation",
    summary="Claim institute affiliation",
    description=(
        "Initiate an email-based affiliation claim. The user supplies the "
        "institute, the role they play there, one of their own verified "
        "email addresses, and their password. A verification email is sent "
        "to the chosen address; calling the verify endpoint confirms it."
    ),
    tags=["Institutes · Affiliations"],
    request=ClaimAffiliateSerializer,
    responses={
        200: OpenApiResponse(
            description="Verification email dispatched.",
            response={
                "type": "object",
                "properties": {
                    "message": {
                        "type": "string",
                        "example": "Email sent successfully.",
                    }
                },
                "required": ["message"],
            },
        ),
        400: OpenApiResponse(description="Validation failed (wrong domain, duplicate affiliation, weak password, etc.)."),
        401: OpenApiResponse(description="Unauthorized."),
    },
)


# ── Verify affiliation ──────────────────────────────────────────────
verify_affiliation_schema = extend_schema(
    operation_id="verify_affiliation",
    summary="Verify an affiliation via email token",
    description=(
        "Confirm the user's email-based affiliation claim using the token "
        "delivered in the verification email."
    ),
    tags=["Institutes · Affiliations"],
    request=VerifyAffiliateSerializer,
    responses={
        200: OpenApiResponse(
            description="Affiliation verified.",
            response={
                "type": "object",
                "properties": {
                    "message": {
                        "type": "string",
                        "example": "Your affiliation with IUT has been verified successfully.",
                    }
                },
                "required": ["message"],
            },
        ),
        400: OpenApiResponse(description="Invalid or expired token."),
        401: OpenApiResponse(description="Unauthorized."),
    },
)


# ── Affiliation id parameter (re-used on the detail endpoints) ──────
_affiliation_pk_param = OpenApiParameter(
    name="pk",
    type=OpenApiTypes.INT,
    location=OpenApiParameter.PATH,
    description="Numeric ID of the InstituteAffiliate row.",
)


# ── List / Create affiliation rows ─────────────────────────────────
list_affiliations_schema = extend_schema(
    operation_id="list_affiliations",
    summary="List affiliations",
    description="Returns a list of all institute affiliations.",
    tags=["Institutes · Affiliations"],
    responses={
        200: OpenApiResponse(
            response=InstituteAffiliateSerializer(many=True),
            description="Paginated list of affiliations.",
        ),
        401: OpenApiResponse(description="Unauthorized."),
    },
)

create_affiliation_schema = extend_schema(
    operation_id="create_affiliation",
    summary="Create affiliation row",
    description="Internal/admin — creates an InstituteAffiliate row directly.",
    tags=["Institutes · Affiliations"],
    request=InstituteAffiliateSerializer,
    responses={
        201: OpenApiResponse(response=InstituteAffiliateSerializer, description="Affiliation created."),
        400: OpenApiResponse(description="Validation failed."),
        401: OpenApiResponse(description="Unauthorized."),
    },
)


# ── Detail: retrieve / update / partial_update / destroy ──────────
retrieve_affiliation_schema = extend_schema(
    operation_id="get_affiliation",
    summary="Retrieve affiliation by ID",
    tags=["Institutes · Affiliations"],
    parameters=[_affiliation_pk_param],
    responses={
        200: OpenApiResponse(response=InstituteAffiliateSerializer, description="Affiliation row."),
        401: OpenApiResponse(description="Unauthorized."),
        404: OpenApiResponse(description="Affiliation not found."),
    },
)

update_affiliation_schema = extend_schema(
    operation_id="update_affiliation",
    summary="Replace affiliation by ID",
    tags=["Institutes · Affiliations"],
    parameters=[_affiliation_pk_param],
    request=InstituteAffiliateSerializer,
    responses={
        200: OpenApiResponse(response=InstituteAffiliateSerializer, description="Affiliation replaced."),
        400: OpenApiResponse(description="Validation failed."),
        401: OpenApiResponse(description="Unauthorized."),
        404: OpenApiResponse(description="Affiliation not found."),
    },
)

partial_update_affiliation_schema = extend_schema(
    operation_id="partial_update_affiliation",
    summary="Partially update affiliation by ID",
    tags=["Institutes · Affiliations"],
    parameters=[_affiliation_pk_param],
    request=InstituteAffiliateSerializer,
    responses={
        200: OpenApiResponse(response=InstituteAffiliateSerializer, description="Affiliation updated."),
        400: OpenApiResponse(description="Validation failed."),
        401: OpenApiResponse(description="Unauthorized."),
        404: OpenApiResponse(description="Affiliation not found."),
    },
)

destroy_affiliation_schema = extend_schema(
    operation_id="delete_affiliation",
    summary="Delete affiliation by ID",
    tags=["Institutes · Affiliations"],
    parameters=[_affiliation_pk_param],
    responses={
        204: OpenApiResponse(description="Affiliation deleted."),
        401: OpenApiResponse(description="Unauthorized."),
        404: OpenApiResponse(description="Affiliation not found."),
    },
)
