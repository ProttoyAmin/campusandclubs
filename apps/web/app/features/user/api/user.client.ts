import { BaseClient } from "~/settings/api/client.base";
import type { ApiResponse } from "~/settings/api/types";
import type {
    AccountsAuthAllRetrieveResponse,
  AccountsAuthAllRetrieveResponses,
  AccountsAuthUsersActivationCreateResponse,
} from "@campus/api";
import { AxiosError, type AxiosResponse } from "axios";
import { config } from "~/settings/app";



export class UserClient extends BaseClient<
  AxiosResponse,
  AccountsAuthAllRetrieveResponse,
  AccountsAuthUsersActivationCreateResponse
> {
  constructor() {
    super(config.api.v1.account.base);
  }

  async grabUsers(): Promise<AxiosResponse<AccountsAuthAllRetrieveResponse[]>> {
    try {
      const response = await this.client.get<
        AccountsAuthAllRetrieveResponse[]>
      (this.endpoint + "all/");
      return response;
    } catch (err) {
      console.error("Grab users error:", (err as AxiosError).response?.data);
      throw err;
    }
  }

  async grabUser(username: string): Promise<AxiosResponse<AccountsAuthAllRetrieveResponse>> {
    try {
      const response = await this.client.get<
        AccountsAuthAllRetrieveResponse>
      (this.endpoint + "users/user/" + username + "/");
      console.log(response)
      return response;
    } catch (err) {
      console.error("Get user error:", (err as AxiosError).response?.data);
      throw err;
    }
  }

}

export const userClient = new UserClient();
