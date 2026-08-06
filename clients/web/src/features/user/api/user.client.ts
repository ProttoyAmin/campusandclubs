import { BaseClient } from "@/settings/api/";
import { config } from "@/settings/app";
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
    super(config.api.v1.account.base);
  }

  async grabUsers(): Promise<AxiosResponse<AccountsAuthUsersRetrieveResponse[]>> {
    try {
      const response = await this.client.get<
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
      const response = await this.client.get<
        AccountsAuthUsersUserRetrieveResponse
      >(this.endpoint + "users/user/" + username + "/");
      return response;
    } catch (err) {
      console.error("Get user error:", (err as AxiosError).response?.data);
      return (err as AxiosError).response?.data as AxiosResponse<AccountsAuthUsersUserRetrieveResponse>;
    }
  }

}

export const userClient = new UserClient();
