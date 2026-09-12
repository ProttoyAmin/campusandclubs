import type {
  PatchedUserProfileRequest,
  SetPasswordRequest,
} from "@campus/api";
import { userClient } from "../api/user.client";
import { UserService } from "./user.service";
import { authentication } from "@/features/auth/services/authentication";
import type { ChangePasswordSchemaType } from "validation/auth";

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

  async verify_email(key: string) {
    return await authentication.verify_email(key);
  }

  async resend_email_verification() {
    return await authentication.resend_email_verification();
  }

  async password_change(data: ChangePasswordSchemaType) {
    const payload = {
      current_password: data.old_password,
      new_password: data.new_password1,
    };

    const response = await this.userClient.passwordChange(payload);
    return response.data;
  }
}

export const accounts = new AccountService();
