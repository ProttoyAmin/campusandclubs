import { BaseClient } from "@/settings/api/";
import type {
  AccountsAuthUsersRetrieveResponse,
  AccountsAuthUsersUserRetrieveResponse
} from "@campus/api";
import { AxiosError, type AxiosResponse } from "axios";

export class UserClient extends BaseClient<
  AxiosResponse,
  AccountsAuthUsersRetrieveResponse,
  any
> {
  constructor() {
    super("/accounts/auth/");
  }

  async grabUsers(): Promise<AxiosResponse<AccountsAuthUsersRetrieveResponse[]>> {
    try {
      const response = await this.client.v1.get<
        AccountsAuthUsersRetrieveResponse[]>
      (this.endpoint + "users/");
      return response;
    } catch (err) {
      console.error("Grab users error:", (err as AxiosError).response?.data);
      throw err;
    }
  }

  async getUser(username: string): Promise<AxiosResponse<AccountsAuthUsersUserRetrieveResponse>> {
    try {
      const response = await this.client.v1.get<
        AccountsAuthUsersUserRetrieveResponse
      >(this.endpoint + "users/user/" + username + "/");
      return response;
    } catch (err) {
      console.error("Get user error:", (err as AxiosError).response?.data);
      throw err;
    }
  }

}

export const userClient = new UserClient();
