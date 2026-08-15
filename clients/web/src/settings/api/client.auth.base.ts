import type { AxiosError, AxiosInstance } from "axios";
import { api } from "./api";
import { AppError } from "../app/error";

/**
 * Base class for API clients that call unauthenticated / public endpoints
 * (sign-up, login, password reset, email verification, refresh).
 *
 * Uses the bare V1PublicClient (no 401 interceptor, no token refresh).
 * Feature-level auth clients should extend this instead of BaseClient.
 */
export abstract class BaseAuthClient {
  protected client: AxiosInstance = api.v1Public.client;

  constructor(
    protected readonly endpoint: string,
    protected readonly allauthBrowser: string | undefined = undefined,
  ) {
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        return Promise.reject(new AppError(error));
      },
    );
  }
}
