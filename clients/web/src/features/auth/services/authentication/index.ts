import type {
  ActivationRequest,
  CustomTokenObtainPairRequestWritable,
  AccountsAuthUsersMeRetrieveResponse
} from "@campus/api";
import type { RegisterRequestWritable } from "@campus/api";
import { authClient } from "../../api/auth.client";
import { api } from "@/settings/api";

export class Authentication {
  public authenticated: boolean = false;

  private apiClient = authClient;

  constructor() {
    // Listen for auth:logout events dispatched by the 401 interceptor
    window.addEventListener("auth:logout", () => {
      this.authenticated = false;
    });
  }

  async login(data: CustomTokenObtainPairRequestWritable) {
    const response = await this.apiClient.login(data);

    if (response.status === 200) {
      this.authenticated = true;
    }

    return response.status;
  }

  async register(data: RegisterRequestWritable) {
    return await this.apiClient.register(data);
  }

  async activate(data: ActivationRequest) {
    return await this.apiClient.activate({
      uid: data.uid,
      token: data.token,
    });
  }

  async logout() {
    this.authenticated = false;
    return await this.apiClient.logout();
  }
  
  async checkSession(): Promise<AccountsAuthUsersMeRetrieveResponse | null> {
    // Lightweight check: try to fetch user info. If cookies are missing or invalid,
    // the 401 interceptor will catch it and attempt a silent refresh.
    try {
      const response = await api.v1.client.get<AccountsAuthUsersMeRetrieveResponse>('/accounts/auth/me/');
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
