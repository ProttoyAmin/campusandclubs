import type {
  PatchedUserProfileRequest,
  SetPasswordRequest,
} from "@campus/api";
import { userClient } from "../api/user.client";

export class UserService {
  private userClient = userClient;
  public authenticated: boolean = false;

  async update(data: PatchedUserProfileRequest) {
    const response = await this.userClient.updateProfile(data);
    return response.data;
  }

  async me() {
    const response = await this.userClient.fetchMe();
    return response.data;
  }

  async emails() {
    const response = await this.userClient.get_my_emails();
    return response.data;
  }

  async affiliations() {
    const response = await this.userClient.get_my_affiliations();
    return response.data;
  }

  async userByUsername(username: string) {
    const response = await this.userClient.getUser(username);
    if (response.status === 404) return null;
    return response.data;
  }

  async posts(userId: string) {
    const response = await this.userClient.getUserPosts(userId);
    return response.data;
  }

  async feed() {
    const response = await this.userClient.fetchFeed();
    return response.data;
  }
}

export const user = new UserService();
