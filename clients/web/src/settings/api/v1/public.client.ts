import { config } from "@/settings/app";
import type { AxiosInstance } from "axios";
import axios from "axios";

/**
 * Bare axios client for unauthenticated / public endpoints
 * (sign-up, login, password reset, email verification, refresh).
 *
 * Unlike V1Client, this has NO 401 interceptor and NO automatic
 * token-refresh logic — only CSRF cookie bootstrapping.
 */
export class V1PublicClient {
  private static instance: V1PublicClient;
  public client: AxiosInstance;
  private csrfBootstrap: Promise<void> | null = null;

  private constructor() {
    this.client = axios.create({
      baseURL: config.api.v1.suffix,
      withCredentials: true,
      xsrfCookieName: "csrftoken",
      xsrfHeaderName: "X-CSRFToken",
      validateStatus: (status) =>
        (status >= 200 && status < 300) || status === 401,
    });

    this.client.interceptors.request.use(async (reqConfig) => {
      if (!this.hasCsrfCookie()) {
        await this.ensureCsrfCookie();
      }
      return reqConfig;
    });
  }

  private ensureCsrfCookie(): Promise<void> {
    if (!this.csrfBootstrap) {
      this.csrfBootstrap = axios
        .get(`${config.api.v1.raw}/api/_allauth/browser/v1/config`, {
          withCredentials: true,
        })
        .then(() => {
          this.csrfBootstrap = null;
        });
    }
    return this.csrfBootstrap;
  }

  private hasCsrfCookie(): boolean {
    return document.cookie.split("; ").some((c) => c.startsWith("csrftoken="));
  }

  public static getInstance(): V1PublicClient {
    if (!V1PublicClient.instance) {
      V1PublicClient.instance = new V1PublicClient();
    }
    return V1PublicClient.instance;
  }
}

export const v1PublicClient = V1PublicClient.getInstance();
