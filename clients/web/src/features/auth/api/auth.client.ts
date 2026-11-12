import { BaseAuthClient } from "@/settings/api/";
import type {
  RegisterWritable,
  RegisterRequestWritable,
  AccountsAuthJwtRefreshCreateResponse,
  RefreshToken,
  ActivationRequest,
} from "@campus/api";
import { AxiosError, type AxiosResponse } from "axios";
import { config } from "@/settings/app";
import type { SignInSchemaType } from "validation/auth";
import { cookie } from "@/settings/storage/cookie";
import { routes } from "@/settings/routes";
import type { AppSession } from "../services/authentication";


export type LoginRequest = {
  login: string;
  password: string;
}


export type AllauthError = {
  errors: {
    message: string;
    code: string;
    param: string;
  }[];
};


export type SignUpRequest = {
  username: string;
  email: string;
  password1: string
  password2: string
}

export type CodeSendResponse = {
  email: string;
  verification_required: boolean;
  code_expires_in: number;
  max_attempts: number;
  expiresAt: number
}

export type ResetPasswordRequestResponse = {
  success: true;
  message: string;
  data: {
    code_expires_in: number;
    max_attempts: number;
    expiresAt?: number;
  }
}

export type SignUpResponse = {
  success: number;
  message: string;
  data: CodeSendResponse
}

// Kept as an alias while sign-up consumers migrate to the shared allauth shape.
export type SignUpError = AllauthError;

export class AuthClient extends BaseAuthClient {
  constructor() {
    super(config.api.v1.account.base, config.api.v1.allauth.base);
  }

  async signUp(
    data: SignUpRequest,
  ): Promise<AxiosResponse<SignUpResponse>> {
    const response = await this.client.post<SignUpResponse>(
      `${this.endpoint}signup/`,
      data,
    );
    return response;
  }

  async activate({ uid, token }: ActivationRequest): Promise<AxiosResponse> {
    try {
      const response = await this.client.post<AxiosResponse>(
        `${this.endpoint}users/activation/`,
        {
          uid,
          token,
        },
      );
      return response;
    } catch (err) {
      console.error("Activate error:", (err as AxiosError).response?.data);
      throw err;
    }
  }

  async verifyPasswordResetCode(code: string): Promise<AxiosResponse> {
    const response = await this.client.post(
      `${this.endpoint}reset-password/verify/`,
      {
        code,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return response;
  }

  async verifyEmail(key: string): Promise<AxiosResponse> {
    const response = await this.client.post(
      `${this.allauthBrowser}auth/email/verify`,
      {
        key,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return response;
  }

  async resendEmailVerification(): Promise<AxiosResponse> {
    const response = await this.client.post(
      `${this.allauthBrowser}auth/email/verify/resend`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return response;
  }

  async login(
    data: SignInSchemaType,
  ): Promise<AxiosResponse<AccountsAuthJwtRefreshCreateResponse>> {
    const response =
      await this.client.post<AccountsAuthJwtRefreshCreateResponse>(
        `${this.endpoint}login/`,
        data,
      );
    return response;
  }

  async loginWithGoogle() {
    await this.getSession();
    const form = document.createElement("form");
    form.method = "POST";
    form.action = `/api/v1/${this.allauthBrowser}auth/provider/redirect`;
    form.style.display = "none";

    const fields: Record<string, string> = {
      provider: "google",
      process: "login",
      callback_url: `${config.app.origin}${routes.auth.public.social_callback}`,
      csrfmiddlewaretoken: cookie.get("csrftoken") ?? "", // 'csrftoken' cookie, same as your allauthClient setup
    };

    for (const [name, value] of Object.entries(fields)) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();
  }

  async logout(): Promise<AxiosResponse> {
    try {
      const response = await this.client.delete(
        `${this.endpoint}session/`,
      );
      // window.dispatchEvent(new Event("auth:logout"));
      return response;
    } catch (err) {
      const axiosErr = err as AxiosError;
      if (axiosErr.response?.status === 401) {
        // window.dispatchEvent(new Event("auth:logout"));
        return axiosErr.response;
      }
      throw err;
    }
  }

  async requestPasswordReset(email: string): Promise<AxiosResponse<ResetPasswordRequestResponse>> {
    const response = await this.client.post<ResetPasswordRequestResponse>(
      this.endpoint + "reset-password/",
      {
        email,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return response;
  }

  async resetPasswordVerify(code: string): Promise<AxiosResponse> {
    const response = await this.client.post(
      this.endpoint + "reset-password/verify/",
      {
        code,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return response;
  }

  async resetPassword(key: string, password: string): Promise<AxiosResponse> {
    const response = await this.client.post(
      this.allauthBrowser + "auth/password/reset",
      {
        key,
        password,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
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

  async getSession(): Promise<AxiosResponse<AppSession>> {
    return this.client.get<AppSession>(`${this.endpoint}session`);
  }
}

export const authClient = new AuthClient();
