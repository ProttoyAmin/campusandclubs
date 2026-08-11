import type {
  ActivationRequest,
} from "@campus/api";
import type { RegisterRequestWritable } from "@campus/api";
import { authClient } from "../../api/auth.client";
import { api } from "@/settings/api";
import type { SignInSchemaType } from "validation/auth";


export type AuthSession = {
  status: number;
  data: {
    user: {
      id: string;
      display: string;
      email: string;
      has_usable_password: boolean;
      username: string;
    }
    methods: string[];
  }
  meta: {
    is_authenticated: boolean;
  }
}

export class Authentication {
  public authenticated: boolean = false;

  private apiClient = authClient;

  constructor() {
    // Listen for auth:logout events dispatched by the 401 interceptor
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

  async signUp(data: RegisterRequestWritable) {
    return await this.apiClient.signUp(data);
  }

  async activate(data: ActivationRequest) {
    return await this.apiClient.activate({
      uid: data.uid,
      token: data.token,
    });
  }

  async logout() {
    const response = await this.apiClient.logout();
    if (response.success) {
      this.authenticated = false;
    }
    return response;
  }

  async checkSession(): Promise<AuthSession | null> {
    // Lightweight check: try to fetch user info. If cookies are missing or invalid,
    // the 401 interceptor will catch it and attempt a silent refresh.
    try {
      const response = await api.v1.client.get<AuthSession>('/_allauth/browser/v1/auth/session');
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
