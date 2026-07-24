import axios, { type AxiosInstance, type AxiosError } from "axios";
import { config } from "@/settings/app";

declare module "axios" {
  export interface AxiosRequestConfig {
    _retry?: boolean;
  }
}

type TokenGetter = () => Promise<string | null>;
type UnauthorizedHandler = (error: AxiosError) => Promise<string | null>;


// API Client for making HTTP requests to the backend API
export class Client {
  private static instance: Client;
  public v1: AxiosInstance;
  private getToken: TokenGetter | null = null;
  private onUnauthorized: UnauthorizedHandler | null = null;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  private constructor() {
    this.v1 = axios.create({
      baseURL: config.api.v1.baseUrl,
      withCredentials: true,
    });

    this.v1.interceptors.request.use(async (config) => {
      if (this.getToken) {
        const token = await this.getToken();
        if (token) config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.v1.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config;
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          this.onUnauthorized
        ) {
          if (this.isRefreshing) {
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(this.v1(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            console.log("refreshing token...");
            const newToken = await this.onUnauthorized(error);
            if (!newToken) throw error;

            this.refreshSubscribers.forEach((cb) => cb(newToken));
            this.refreshSubscribers = [];

            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.v1(originalRequest);
          } catch (refreshError) {
            this.refreshSubscribers = [];
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        console.error("[API Error]:", error.response?.data || error.message);
        return Promise.reject(error);
      },
    );
  }

  public static getInstance(): Client {
    if (!Client.instance) Client.instance = new Client();
    return Client.instance;
  }

  public setTokenGetter(fn: TokenGetter) {
    this.getToken = fn;
  }

  public setUnauthorizedHandler(fn: UnauthorizedHandler) {
    this.onUnauthorized = fn;
  }
}

export const api = Client.getInstance();
