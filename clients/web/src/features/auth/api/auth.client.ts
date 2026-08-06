import { BaseClient } from "@/settings/api/";
import type { ApiResponse } from "@/settings/api/";
import type {
  RegisterWritable,
  RegisterRequestWritable,
  AccountsAuthJwtRefreshCreateResponse,
  CustomTokenObtainPairRequestWritable,
  TokenVerifyRequest,
  TokenRefresh,
  ActivationRequest,
} from "@campus/api";
import { AxiosError, type AxiosResponse } from "axios";
import { config } from "@/settings/app";

export class AuthClient extends BaseClient<
  AxiosResponse,
  RegisterRequestWritable,
  AccountsAuthJwtRefreshCreateResponse
> {
  constructor() {
    super(config.api.v1.account.base);
  }

  async register(
    data: RegisterWritable,
  ): Promise<AxiosResponse<RegisterRequestWritable>> {
    try {
      const response = await this.client.post<
        RegisterRequestWritable>
      (`${this.endpoint}users/`, data);
      return response;
    } catch (err) {
      console.error("Register error:", (err as AxiosError).response?.data);
      throw err;
    }
  }

  async activate({ uid, token }: ActivationRequest): Promise<AxiosResponse> {
    try {
      const response = await this.client.post<AxiosResponse>(`${this.endpoint}users/activation/`, {
        uid,
        token,
      });
      return response;
    } catch (err) {
      console.error("Activate error:", (err as AxiosError).response?.data);
      throw err;
    }
  }

  async login(
    data: CustomTokenObtainPairRequestWritable,
  ): Promise<AxiosResponse<AccountsAuthJwtRefreshCreateResponse>> {
    try {
      const response = await this.client.post<AccountsAuthJwtRefreshCreateResponse>(`${this.endpoint}login/`, data);
      console.log("response", response)
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

  async refresh(): Promise<AxiosResponse<TokenRefresh>> {
    try {
      const response = await this.client.post<TokenRefresh>(
        `${this.endpoint}refresh/`,
      );
      return response;
    } catch (err) {
      console.error("Refresh error:", (err as AxiosError).response?.data);
      throw err;
    }
  }
}

export const authClient = new AuthClient();
