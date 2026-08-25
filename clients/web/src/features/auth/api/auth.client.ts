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

export type AllauthError = {
  errors: {
    message: string;
    code: string;
    param: string;
  }[];
};

// Kept as an alias while sign-up consumers migrate to the shared allauth shape.
export type SignUpError = AllauthError;

export class AuthClient extends BaseAuthClient {
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

  async login(
    data: SignInSchemaType,
  ): Promise<AxiosResponse<AccountsAuthJwtRefreshCreateResponse>> {
    const response =
      await this.client.post<AccountsAuthJwtRefreshCreateResponse>(
        `${this.allauthBrowser}auth/login`,
        data,
      );
    return response;
  }

  async loginWithGoogle() {
    await this.getSession();
    const form = document.createElement("form");
    form.method = "POST";
    // form.action = `http://127.0.0.1:8000/api/${this.allauthBrowser}auth/provider/redirect`;
    form.action = `/api/${this.allauthBrowser}auth/provider/redirect`;
    form.style.display = "none";

    const fields: Record<string, string> = {
      provider: "google",
      process: "login",
      callback_url: `${window.location.origin}${routes.auth.public.social_callback}`,
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
    console.log(form)
    form.submit();
  }

  async logout(): Promise<AxiosResponse> {
    try {
      const response = await this.client.delete(
        `${this.allauthBrowser}auth/session`,
      );
      window.dispatchEvent(new Event("auth:logout"));
      return response;
    } catch (err) {
      const axiosErr = err as AxiosError;
      if (axiosErr.response?.status === 401) {
        window.dispatchEvent(new Event("auth:logout"));
        return axiosErr.response;
      }
      throw err;
    }
  }

  async requestPasswordReset(email: string): Promise<AxiosResponse> {
    const response = await this.client.post(
      this.allauthBrowser + "auth/password/request",
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

  async getSession(): Promise<AxiosResponse> {
    return this.client.get(`${this.allauthBrowser}auth/session`);
  }
}

export const authClient = new AuthClient();
