# core/response.py
from rest_framework.response import Response
from rest_framework import status


class ApiResponse(Response):
    """Standard {success, message, data} envelope for every endpoint."""

    def __init__(
        self,
        data=None,
        message: str = "",
        success: bool = True,
        status_code: int = status.HTTP_200_OK,
        **kwargs,
    ):
        payload = {"success": success, "message": message, "data": data}
        super().__init__(payload, status=status_code, **kwargs)


# core/response.py
class ApiError(ApiResponse):
    def __init__(
        self,
        message: str = "Something went wrong.",
        errors: dict | None = None,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        **kwargs,
    ):
        payload_data = {"errors": errors} if errors else None
        super().__init__(data=payload_data, message=message, success=False, status_code=status_code, **kwargs)