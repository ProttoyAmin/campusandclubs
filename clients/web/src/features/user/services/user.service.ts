import type {
  PatchedUserProfileRequest,
  SetPasswordRequest,
} from "@campus/api";
import { userClient } from "../api/user.client";

export class UserService {
  private userClient = userClient;
  public authenticated: boolean = false;

  async users() {
    const users = await this.userClient.grabUsers();
    return users;
  }

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

  async add_email(email: string) {
    const response = await this.userClient.addEmail(email);
    return response.data;
  }

  async request_email_verification(email: string) {
    const response = await this.userClient.requestEmailVerification(email);
    return response.data;
  }

  async delete_email(email: string) {
    const response = await this.userClient.deleteEmail(email);
    return response.data;
  }

  async change_primary_email(email: string) {
    const response = await this.userClient.changePrimaryEmail(email);
    return response.data;
  }

  async password_change(data: SetPasswordRequest) {
    const response = await this.userClient.passwordChange(data);
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

  async feed() {
    const response = await this.userClient.fetchFeed();
    return response.data;
  }
}

export const account = new UserService();
