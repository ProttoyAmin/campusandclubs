import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import ConnectionErrorPage from "./connection-error-page";
import NotFound from "./not-found";
import ServerErrorPage from "./server-error-page";
import UnexpectedErrorPage from "./unexpected-error-page";

export default function RouteErrorBoundary() {
  const error = useRouteError();

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return <ConnectionErrorPage />;
  }

  if (isRouteErrorResponse(error)) {
    if (error.status >= 500) {
      return <ServerErrorPage status={error.status} />;
    }

    if (error.status === 404) {
      return <NotFound />;
    }
  }

  if (error && typeof error === "object") {
    const maybeHttpError = error as {
      status?: number;
      response?: { status?: number };
      request?: unknown;
    };
    const status = maybeHttpError.status ?? maybeHttpError.response?.status;

    if (status !== undefined && status >= 500) {
      return <ServerErrorPage status={status} />;
    }

    if (maybeHttpError.request && !maybeHttpError.response) {
      return <ConnectionErrorPage />;
    }
  }

  return <UnexpectedErrorPage />;
}
