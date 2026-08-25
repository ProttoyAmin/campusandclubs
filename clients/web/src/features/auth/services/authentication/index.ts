import type { ActivationRequest } from "@campus/api";
import type { RegisterRequestWritable } from "@campus/api";
import { authClient } from "../../api/auth.client";
import type { SignInSchemaType } from "validation/auth";
import { cookie } from "@/settings/storage/cookie";

export type AuthUser = {
  id: string;
  display: string;
  email: string;
  has_usable_password: boolean;
  username: string;
};

export type AuthSession = {
  status: number;
  data: {
    user: AuthUser | null;
    methods: string[];
  };
  meta: {
    is_authenticated: boolean;
  };
};

export type SocialProvider = "google" | "facebook" | "github";

export class Authentication {
  public authenticated: boolean = false;

  private apiClient = authClient;

  constructor() {
    window.addEventListener("auth:logout", () => {
      this.authenticated = false;
    });
  }

  async login(data: SignInSchemaType) {
    const response = await this.apiClient.login(data);

    if (response.status === 200) {
      this.authenticated = true;
    }

    return response;
  }

  submitSocialLogin(provider: SocialProvider) {
    const csrfToken = cookie.get("csrftoken");
    console.log(csrfToken)
    if (!csrfToken) {
      throw new Error(
        "Missing CSRF token — session must be initialized before social login.",
      );
    }

    const form = document.getElementById(
      `social-login-form-${provider}`,
    ) as HTMLFormElement | null;
    if (!form) throw new Error(`No registered form for provider "${provider}"`);

    const csrfInput = form.querySelector(
      'input[name="csrfmiddlewaretoken"]',
    ) as HTMLInputElement;
    csrfInput.value = csrfToken; // set right before submit, always fresh

    form.requestSubmit();
  }

  async sign_up(data: RegisterRequestWritable) {
    return await this.apiClient.signUp(data);
  }

  async verify_email(key: string) {
    return await this.apiClient.verifyEmail(key);
  }

  async activate(data: ActivationRequest) {
    return await this.apiClient.activate({
      uid: data.uid,
      token: data.token,
    });
  }

  async request_password_reset(email: string) {
    const response = await this.apiClient.requestPasswordReset(email);
    return response.data;
  }

  async reset_password(key: string, new_password: string) {
    const response = await this.apiClient.resetPassword(key, new_password);
    return response.data;
  }

  async logout() {
    const response = await this.apiClient.logout();
    if (response.data.success) {
      this.authenticated = false;
    }
    return response;
  }

  async check_session(): Promise<AuthSession | null> {
    try {
      const response = await this.apiClient.getSession();
      if (response.status === 200) {
        this.authenticated = true;
        return response.data;
      }
      return null;
    } catch {
      this.authenticated = false;
      return null;
    }
  }
}

export const authentication = new Authentication();
