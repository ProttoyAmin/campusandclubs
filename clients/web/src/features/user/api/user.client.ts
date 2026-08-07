import { BaseClient } from "@/settings/api/";
import { config } from "@/settings/app";
import type {
  AccountsAuthUsersRetrieveResponse,
  AccountsAuthUsersUserRetrieveResponse,
  PrivateUserResponse,
} from "@campus/api";
import { AxiosError, type AxiosResponse } from "axios";

type UserResponse = AccountsAuthUsersUserRetrieveResponse | PrivateUserResponse;

export class UserClient extends BaseClient<
  AxiosResponse,
  AccountsAuthUsersRetrieveResponse,
  any
> {
  constructor() {
    super(config.api.v1.account.base);
  }

  async grabUsers(): Promise<
    AxiosResponse<AccountsAuthUsersRetrieveResponse[]>
  > {
    try {
      const response = await this.client.get<
        AccountsAuthUsersRetrieveResponse[]
      >(this.endpoint + "users/");
      return response;
    } catch (err) {
      console.error("Grab users error:", (err as AxiosError).response?.data);
      throw err;
    }
  }

  async getUser(
    username: string,
  ): Promise<AxiosResponse<UserResponse>> {
    try {
      const response =
        await this.client.get<UserResponse>(
          this.endpoint + "users/user/" + username + "/",
        );
      return response;
    } catch (error) {
      const axiosError = error as AxiosError<UserResponse>;
      if (axiosError.response && (axiosError.response.status === 403 || axiosError.response.status === 404)) {
        return axiosError.response;
      }
      throw error;
    }
  }

  async fetchFeed(): Promise<AxiosResponse> {
    try {
      const response = await this.client.get(this.endpoint + "feed/");
      return response;
    } catch (err) {
      console.error("Feed error:", (err as AxiosError).response?.data);
      throw err;
    }
  }
}

export const userClient = new UserClient();
