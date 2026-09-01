import type {
  PatchedUserProfileRequest,
  SetPasswordRequest,
} from "@campus/api";
import { userClient } from "../api/user.client";
import { UserService } from "./user.service";

class AccountService {
  private userClient = userClient;
  public user = new UserService();

  async users() {
    const users = await this.userClient.grabUsers();
    return users;
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
}

export const accounts = new AccountService();
