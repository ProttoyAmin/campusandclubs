import type { ActivationRequest } from "@campus/api";
import type { RegisterRequestWritable } from "@campus/api";
import { authClient } from "../../api/auth.client";
import type { SignInSchemaType } from "validation/auth";

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
