import { config } from "@/settings/app";
import type { Client } from "@campus/api/client";
import { createClient } from "@campus/api/client";
import type { AxiosError } from "axios";

declare module "axios" {
  export interface AxiosRequestConfig {
    _retry?: boolean;
  }
}

type TokenGetter = () => Promise<string | null>;
type UnauthorizedHandler = (error: AxiosError) => Promise<string | null>;

export class V1Client {
  private static instance: V1Client;
  public client: Client;
  private getToken: TokenGetter | null = null;
  private onUnauthorized: UnauthorizedHandler | null = null;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  private constructor() {
    this.client = createClient({
      baseURL: config.api.v1.raw,
    });

    this.client.instance.interceptors.request.use(async (config) => {
      console.log("interceptor", config);
      if (this.getToken) {
        const token = await this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });

    this.client.instance.interceptors.response.use(
      (response) => {
        console.log("response interceptor", response);
        return response;
      },
      async (error: AxiosError) => {
        console.log("response error interceptor", error.config);
        const originalRequest = error.config;
        console.log("original request: ", originalRequest);
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          this.onUnauthorized
        ) {
          console.log("retry", originalRequest);
          if (this.isRefreshing) {
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(this.client.instance(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newToken = await this.onUnauthorized(error);
            console.log(newToken)
            if (!newToken) throw error;

            this.refreshSubscribers.forEach((cb) => cb(newToken));
            this.refreshSubscribers = [];

            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.client.instance(originalRequest);
          } catch (refreshError) {
            this.refreshSubscribers = [];
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }
        return Promise.reject(error);
      },
    );
  }

  public static getInstance(): V1Client {
    if (!V1Client.instance) {
      V1Client.instance = new V1Client();
    }
    return V1Client.instance;
  }

  public setTokenGetter(getToken: TokenGetter): void {
    this.getToken = getToken;
  }

  public setUnauthorizedHandler(handler: UnauthorizedHandler): void {
    this.onUnauthorized = handler;
  }
}

export const v1Client = V1Client.getInstance();
