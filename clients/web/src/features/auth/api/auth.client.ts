import { BaseClient } from "@/settings/api/";
import type { ApiResponse } from "@/settings/api/";
import type {
  RegisterWritable,
  RegisterRequestWritable,
  ApiAccountsAuthJwtRefreshCreateResponse,
  RefreshToken,
  ActivationRequest,
} from "@campus/api";
import { AxiosError, type AxiosResponse } from "axios";
import { config } from "@/settings/app";
import type { SignInSchemaType } from "validation/auth";

export type AllauthError = {
  errors: {
    message: string;
    code: string;
    param: string;
  }[]
}

// Kept as an alias while sign-up consumers migrate to the shared allauth shape.
export type SignUpError = AllauthError;

export class AuthClient extends BaseClient<
  AxiosResponse,
  RegisterRequestWritable,
  ApiAccountsAuthJwtRefreshCreateResponse
> {
  constructor() {
    super(config.api.v1.account.base, config.api.v1.allauth.base);
  }

  async signUp(
    data: RegisterWritable,
  ): Promise<AxiosResponse<RegisterRequestWritable>> {
    const response = await this.client.post<RegisterRequestWritable>(
      `${this.allauthBrowser}auth/signup`,
      data,
    );
    return response;
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
    data: SignInSchemaType,
  ): Promise<AxiosResponse<ApiAccountsAuthJwtRefreshCreateResponse>> {
    const response = (await this.client.post<ApiAccountsAuthJwtRefreshCreateResponse>(`${this.allauthBrowser}auth/login`, data));
    return response;
  }

  async logout(): Promise<ApiResponse> {
    try {
      const response = await this.client.delete<ApiResponse>(
        `${this.allauthBrowser}auth/session`,
      );
      return response.data;
    } catch (err) {
      console.error("Logout error:", (err as AxiosError).response?.data);
      throw err;
    }
  }

  async requestPasswordReset(email: string): Promise<AxiosResponse> {
    const response = await this.client.post(this.allauthBrowser + "auth/password/request", {
      email
    }, {
      headers: {
        "Content-Type": "application/json"
      }
    });
    return response;
  }

  async resetPassword(key: string, password: string): Promise<AxiosResponse> {
    const response = await this.client.post(this.allauthBrowser + "auth/password/reset", {
      key,
      password
    }, {
      headers: {
        "Content-Type": "application/json"
      }
    });
    return response;
  }

  async refresh(): Promise<AxiosResponse<RefreshToken>> {
    try {
      const response = await this.client.post<RefreshToken>(
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
