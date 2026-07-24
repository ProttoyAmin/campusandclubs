import { authClient } from "@/features/auth/api/auth.client";
import type { CustomTokenObtainPairWritable } from "@campus/api";
import type { RegisterWritable } from "@campus/api";
import { storage } from "@/settings/storage/";
import { api } from "@/settings/api";

export class Authentication {
  private authClient = authClient;
  public authenticated: boolean = false;

  constructor() {
    // Wire up the API client at construction time so every request
    // gets the stored access token and 401s trigger refresh automatically.
    // This runs once when the module-level singleton is created.
    api.setTokenGetter(async () => {
      return storage.token.getAccessToken() ?? null;
    });

    api.setUnauthorizedHandler(async () => {
      return this.refresh();
    });
  }

  async login(data: CustomTokenObtainPairWritable) {
    const response = await this.authClient.login(data);
    if (response.status === 200) {
      this.authenticated = true;
      storage.token.setAccessToken(response.data.access);
      storage.token.setRefreshToken(response.data.refresh);
      return response;
    }
    return response;
  }

  async register(data: RegisterWritable) {
    console.log(await this.authClient.register(data));
    return await this.authClient.register(data);
  }

  async logout() {
    storage.token.removeAccessToken();
    storage.token.removeRefreshToken();
    this.authenticated = false;
    return await this.authClient.logout();
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
      const response = await authClient.refresh(refreshToken);
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

    const isValid = await authClient.verify(accessToken);
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
