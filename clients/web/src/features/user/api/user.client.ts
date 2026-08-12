import { BaseClient } from "@/settings/api/";
import { config } from "@/settings/app";
import type {
  ApiAccountsAuthUsersRetrieveResponse,
  PaginatedUserProfileList,
  ApiAccountsAuthUsersUserRetrieveResponse,
  PatchedUserProfileRequest
} from "@campus/api";

import { AxiosError, type AxiosResponse } from "axios";


export type PrivateUserResponse = {
  detail: string;
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar: string;
  following_count: number;
  follower_count: number;
  user_post_count: number;
  is_private: boolean;
  is_following: boolean;
  follow_status: string | null;
};

export type UserResponse = ApiAccountsAuthUsersUserRetrieveResponse | PrivateUserResponse;

export class UserClient extends BaseClient<
  AxiosResponse,
  ApiAccountsAuthUsersRetrieveResponse,
  any
> {
  constructor() {
    super(config.api.v1.account.base, config.api.v1.allauth.base);
  }

  async grabUsers(): Promise<
    AxiosResponse<PaginatedUserProfileList>
  > {
    try {
      const response = await this.client.get<
        PaginatedUserProfileList
      >(this.endpoint + "all/");
      return response;
    } catch (err) {
      console.error("Grab users error:", (err as AxiosError).response?.data);
      throw err;
    }
  }

  async updateProfile(data: PatchedUserProfileRequest): Promise<AxiosResponse> {
    const response = await this.client.patch(this.endpoint + "users/me/", data);
    return response;
  }

  async fetchMe(): Promise<AxiosResponse<UserResponse>> {
    const response = await this.client.get<UserResponse>(this.endpoint + "me/");
    return response;
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
