/**
 * Base HTTP client (axios instance).
 *
 * ONE axios instance to rule them all — every per-feature http module
 * imports this single client so auth headers, CSRF, 401 handling, and
 * baseURL are configured in one place.
 *
 * Fill in the interceptors when wiring auth. Leave bodies empty on purpose.
 */
import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { getCookie } from "typescript-cookie";

const API_BASE_URL = import.meta.env.VITE_PUBLIC_API_URL ?? "";

class HttpClient {
  public readonly instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: `${API_BASE_URL}/api/v1`,
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.instance.interceptors.request.use(
      (config) => this.onRequest(config),
      (error) => Promise.reject(error),
    );

    this.instance.interceptors.response.use(
      (response) => response,
      (error) => this.onResponseError(error),
    );
  }

  /**
   * Attach CSRF token / Authorization header on every request.
   * TODO: wire `csrftoken` cookie (django-allauth) and/or session logic.
   */
  private onRequest(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig> {
    const csrfToken = getCookie("csrftoken");
    if (csrfToken) {
      config.headers.set("X-CSRFToken", csrfToken);
    }
    return config;
  }

  /**
   * Global response error handler:
   *   - 401 → flip session to ANONYMOUS_SESSION (TODO).
   *   - Otherwise, let features handle.
   */
  private async onResponseError(error: unknown): Promise<never> {
    // TODO: handle 401/403 globally via QueryClient.
    return Promise.reject(error);
  }
}

export const http = new HttpClient().instance;
export default http;
