import type { PatchedUserProfileRequest } from "@campus/api";
import { userClient } from "../api/user.client";

export class UserService {
  private userClient = userClient;
  public authenticated: boolean = false;

  // constructor() {
  //   this.api.setTokenGetter(async () => {
  //     return storage.token.getAccessToken() ?? null;
  //   });

  //   this.api.setUnauthorizedHandler(async () => {
  //     return storage.token.getRefreshToken();
  //   });
  // }

  async users() {
    const users = await this.userClient.grabUsers()
    return users;
  }

  async update(data: PatchedUserProfileRequest) {
    const response = await this.userClient.updateProfile(data)
    return response.data;
  }

  async me() {
    const response = await this.userClient.fetchMe()
    return response.data
  }

  async userByUsername(username: string) {
    const response = await this.userClient.getUser(username)
    if (response.status === 404) return null;
    return response.data;
  }

  async feed() {
    const response = await this.userClient.fetchFeed()
    return response.data;
  }
}

export const account = new UserService();
