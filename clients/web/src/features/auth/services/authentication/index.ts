import type {
  ActivationRequest,
  CustomTokenObtainPairRequestWritable,
} from "@campus/api";
import type { RegisterRequestWritable } from "@campus/api";
import { storage } from "@/settings/storage/";
// import { v1Client } from "@/settings/api/v1/client";
import { accountsAuthLogoutCreate } from "@campus/api";
import { authClient } from "../../api/auth.client";
import { api } from "@/settings/api";

export class Authentication {
  public authenticated: boolean = false;

  private apiClient = authClient;
  private api = api;

  constructor() {
    // Wire up the API client at construction time so every request
    // gets the stored access token and 401s trigger refresh automatically.
    // This runs once when the module-level singleton is created.
    // this.api.setTokenGetter(async () => {
    //   return storage.token.getAccessToken() ?? null;
    // });

    // this.api.setUnauthorizedHandler(async () => {
    //   return this.refresh();
    // });
  }

  init() {
    this.api.setTokenGetter(async () => storage.token.getAccessToken() ?? null);
    this.api.setUnauthorizedHandler(async () => this.refresh());
  }

  async login(data: CustomTokenObtainPairRequestWritable) {
    const response = await this.apiClient.login(data);

    // const res = await login({
    //   client: this.api.client,
    //   body: data,
    // });

    if (response.status === 200) {
      this.authenticated = true;
      storage.token.setAccessToken(response.data.access);
      storage.token.setRefreshToken(response.data.refresh);
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
    storage.token.removeAccessToken();
    storage.token.removeRefreshToken();
    this.authenticated = false;
    return await accountsAuthLogoutCreate();
  }

  /**
   * Attempt to refresh tokens using the stored refresh token.
   * The backend returns BOTH a new access AND a new refresh token
   * (token blacklisting), so we store both.
   *
   * Returns the new access token on success, or null on failure
   * (which lets the interceptor reject the original request).
   */
  private async refresh(): Promise<string | null> {
    const refreshToken = storage.token.getRefreshToken();
    if (!refreshToken) return null;

    try {
      const response = await this.apiClient.refresh(refreshToken);
      storage.token.setAccessToken(response.data.access);
      storage.token.setRefreshToken(response.data.refresh);
      this.authenticated = true;
      return response.data.access;
    } catch {
      storage.token.removeAccessToken();
      storage.token.removeRefreshToken();
      this.authenticated = false;
      return null;
    }
  }

  async checkSession(): Promise<boolean> {
    const accessToken = storage.token.getAccessToken();
    if (!accessToken) {
      this.authenticated = false;
      return false;
    }

    const isValid = await this.apiClient.verify(accessToken);
    if (isValid) {
      this.authenticated = true;
      return true;
    }

    const newToken = await this.refresh();
    this.authenticated = !!newToken;
    return this.authenticated;
  }
}

export const authentication = new Authentication();
