import { config } from "@/settings/app";
import type { AxiosError, AxiosInstance } from "axios";
import axios from "axios";

declare module "axios" {
  export interface AxiosRequestConfig {
    _retry?: boolean;
  }
}

export class V1Client {
  private static instance: V1Client;
  public client: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: ((success: boolean) => void)[] = [];

  private constructor() {
    this.client = axios.create({
      baseURL: config.api.v1.suffix,
      withCredentials: true
    });

    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config;
        if (
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest._retry
        ) {
          console.log("retry", originalRequest);
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.refreshSubscribers.push((success: boolean) => {
                if (success) {
                   resolve(this.client(originalRequest));
                } else {
                   reject(error);
                }
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            console.log('Trying silent refresh...')
            // Call the refresh endpoint directly
            await axios.post(
               `${config.api.v1.suffix}${config.api.v1.account.base}refresh/`,
               {},
               { withCredentials: true }
            );
            
            this.refreshSubscribers.forEach((cb) => cb(true));
            this.refreshSubscribers = [];

            return this.client(originalRequest);
          } catch (refreshError) {
            this.refreshSubscribers.forEach((cb) => cb(false));
            this.refreshSubscribers = [];
            
            // Dispatch event to clear auth state
            window.dispatchEvent(new Event("auth:logout"));
            
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
}

export const v1Client = V1Client.getInstance();
