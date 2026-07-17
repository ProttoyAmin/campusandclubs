
from drf_spectacular.utils import extend_schema, OpenApiParameter

club_list_schema = extend_schema(
    summary="List clubs",
    description="Returns a list of clubs visible to the authenticated user.",
    parameters=[
        OpenApiParameter("search", description="Search by club name or origin", required=False, type=str),
        OpenApiParameter("privacy", description="Filter by privacy type (public/closed/secret)", required=False, type=str),
        OpenApiParameter("origin", description="Filter by specific origin", required=False, type=str),
        OpenApiParameter("joined", description="Set to 'true' to only show clubs user is member of", required=False, type=str),
    ],
)