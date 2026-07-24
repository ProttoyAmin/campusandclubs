import { BaseClient } from "@/settings/api/";
import type { ApiResponse } from "@/settings/api/";
import type {
  RegisterWritable,
  RegisterCreateResponse,
  JwtRefreshCreateResponse,
  CustomTokenObtainPairWritable,
  TokenVerify,
  TokenRefresh,
} from "@campus/api";
import { AxiosError, type AxiosResponse } from "axios";
import { config } from "@/settings/app";

export class AuthClient extends BaseClient<
  AxiosResponse,
  RegisterCreateResponse,
  JwtRefreshCreateResponse
> {
  constructor() {
    super(config.api.v1.account.base);
  }

  async register(
    data: RegisterWritable,
  ): Promise<AxiosResponse<RegisterCreateResponse>> {
    try {
      const response = await this.client.post<
        RegisterCreateResponse>
      (`${this.endpoint}register/`, data);
      return response;
    } catch (err) {
      console.error("Register error:", (err as AxiosError).response?.data);
      throw err;
    }
  }

  async login(
    data: CustomTokenObtainPairWritable,
  ): Promise<AxiosResponse<JwtRefreshCreateResponse>> {
    try {
      const response = await this.client.post(`${this.endpoint}login/`, data);
      return response;
    } catch (err) {
      console.error("Login error:", (err as AxiosError).response?.data);
      throw err as AxiosError;
    }
  }

  async logout(): Promise<ApiResponse> {
    try {
      const response = await this.client.post<ApiResponse>(
        `${this.endpoint}logout/`,
      );
      return response.data;
    } catch (err) {
      console.error("Logout error:", (err as AxiosError).response?.data);
      throw err;
    }
  }

  async refresh(refreshToken: string): Promise<AxiosResponse<TokenRefresh>> {
    try {
      const response = await this.client.post<TokenRefresh>(
        `${this.endpoint}jwt/refresh/`,
        { refresh: refreshToken },
      );
      return response;
    } catch (err) {
      console.error("Refresh error:", (err as AxiosError).response?.data);
      throw err;
    }
  }

  async verify(token: string): Promise<boolean> {
    try {
      await this.client.post<TokenVerify>(`${this.endpoint}jwt/verify/`, {
        token,
      });
      return true;
    } catch {
      return false;
    }
  }
}

export const authClient = new AuthClient();
