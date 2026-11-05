from django.http import HttpRequest, HttpResponse


class RequestLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request: HttpRequest) -> HttpResponse:
        print("Incoming request:", request.method, request.path)

        response: HttpResponse = self.get_response(request)

        print("Outgoing response:", response.status_code)

        return response