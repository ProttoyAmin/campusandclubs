import axios, { isAxiosError } from "axios";

export type AppFailureKind = "server" | "connection";

export type AppFailureDetail = {
  kind: AppFailureKind;
  status?: number;
};

export const APP_FAILURE_EVENT = "campusandclubs:app-failure";

export function reportAppFailure(detail: AppFailureDetail): void {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent<AppFailureDetail>(APP_FAILURE_EVENT, { detail }),
  );
}

/** Turns failed API requests into app-wide server or connection screens. */
export function reportAxiosFailure(error: unknown): void {
  if (!isAxiosError(error) || axios.isCancel(error)) return;

  const status = error.response?.status;
  if (status !== undefined && status >= 500) {
    reportAppFailure({ kind: "server", status });
    return;
  }

  // Axios has no response when the service cannot be reached, including when
  // the browser is offline. A server-side outage without an HTTP status can
  // look the same, so the page asks the user to check their connection too.
  if (!error.response && error.request) {
    reportAppFailure({ kind: "connection" });
  }
}
