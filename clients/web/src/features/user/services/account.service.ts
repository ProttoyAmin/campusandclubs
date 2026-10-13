import type {
  PatchedUserProfileRequest,
  SetPasswordRequest,
} from "@campus/api";
import { userClient } from "../api/user.client";
import { useSession } from "@/features/auth/hooks";
import { UserService } from "./user.service";
import { authentication, type AuthSession } from "@/features/auth/services/authentication";
import type { ChangePasswordSchemaType } from "validation/auth";
import { queryClient } from "@/config/query-client";

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
    const session: AuthSession = queryClient.getQueryData(["auth", "session"])

    let payload: Partial<SetPasswordRequest>;

    if (!session?.data?.user?.has_usable_password) {
      payload = {
        new_password: data.new_password,
      };
    } else {
      payload = {
        current_password: data.current_password,
        new_password: data.new_password,
      };
    }

    const response = await this.userClient.passwordChange(payload as SetPasswordRequest);
    return response.data;
  }

  async search(username: string) {
    const response = await this.userClient.searchUsers(username);
    return response.data;
  }
}

export const accounts = new AccountService();
