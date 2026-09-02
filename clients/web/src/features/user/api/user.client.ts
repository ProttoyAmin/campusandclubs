import { BaseClient } from "@/settings/api/";
import { config } from "@/settings/app";
import type {
  AccountsAuthUsersRetrieveResponse,
  PaginatedUserProfileList,
  AccountsAuthUsersUserRetrieveResponse,
  PatchedUserProfileRequest,
  UserEmail,
  GetMyAffiliationsResponse,
  SetPasswordRequest,
  AccountsAuthUsersSetPasswordCreateResponse,
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

export type UserResponse =
  | AccountsAuthUsersUserRetrieveResponse
  | PrivateUserResponse;

export class UserClient extends BaseClient<
  AxiosResponse,
  AccountsAuthUsersRetrieveResponse,
  any
> {
  constructor() {
    super(config.api.v1.account.base, config.api.v1.allauth.base);
  }

  async grabUsers(): Promise<AxiosResponse<PaginatedUserProfileList>> {
    try {
      const response = await this.client.get<PaginatedUserProfileList>(
        this.endpoint + "all/",
      );
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

  async getUser(username: string): Promise<AxiosResponse<UserResponse>> {
    try {
      const response = await this.client.get<UserResponse>(
        this.endpoint + "users/user/" + username + "/",
      );
      return response;
    } catch (error) {
      const axiosError = error as AxiosError<UserResponse>;
      if (
        axiosError.response &&
        (axiosError.response.status === 403 ||
          axiosError.response.status === 404)
      ) {
        return axiosError.response;
      }
      throw error;
    }
  }

  async get_my_emails() {
    const response = await this.client.get<UserEmail[]>(
      this.endpoint + "me/emails/",
    );
    return response;
  }

  async addEmail(email: string) {
    const resopnse = await this.client.post<UserEmail>(
      `${this.allauthBrowser}account/email`,
      {
        email,
      },
    );
    return resopnse;
  }

  async requestEmailVerification(email: string): Promise<AxiosResponse> {
    const response = await this.client.put(
      `${this.allauthBrowser}account/email`,
      { email },
    );
    return response;
  }

  async changePrimaryEmail(email: string): Promise<AxiosResponse<UserEmail[]>> {
    const response = await this.client.put<UserEmail[]>(
      `${this.allauthBrowser}account/email`,
      { email: email, primary: true },
    );
    return response;
  }

  async deleteEmail(email: string): Promise<AxiosResponse<UserEmail[]>> {
    const response = await this.client.delete<UserEmail[]>(
      `${this.allauthBrowser}account/email`,
      { data: { email } },
    );
    return response;
  }

  async passwordChange(
    data: SetPasswordRequest,
  ): Promise<AxiosResponse<AccountsAuthUsersSetPasswordCreateResponse>> {
    const response =
      await this.client.post<AccountsAuthUsersSetPasswordCreateResponse>(
        `${this.allauthBrowser}account/password/change/`,
        data,
      );
    return response;
  }

  async get_my_affiliations() {
    const response = await this.client.get<GetMyAffiliationsResponse[]>(
      this.endpoint + "me/affiliations/",
    );
    return response;
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

  async getUserPosts(userId: string) {
    const response = await this.client.get(
      this.endpoint + `users/${userId}/posts`,
    );
    return response;
  }
}

export const userClient = new UserClient();
