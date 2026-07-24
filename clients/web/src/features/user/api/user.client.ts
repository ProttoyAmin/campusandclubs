import { BaseClient } from "@/settings/api/";
import type { ApiResponse } from "@/settings/api/";
import type {
  V1AccountsAuthAllRetrieveResponses,
  V1AccountsAuthUsersActivationCreateResponse,
} from "@campus/api";
import { AxiosError, type AxiosResponse } from "axios";

export class UserClient extends BaseClient<
  ApiResponse,
  V1AccountsAuthAllRetrieveResponses,
  V1AccountsAuthUsersActivationCreateResponse
> {
  constructor() {
    super("/accounts/auth/");
  }

  async grabUsers(): Promise<AxiosResponse<V1AccountsAuthAllRetrieveResponses>> {
    try {
      const response = await this.client.get<
        V1AccountsAuthAllRetrieveResponses>
      (`${this.endpoint}all/`);
      return response;
    } catch (err) {
      console.error("Grab users error:", (err as AxiosError).response?.data);
      throw err;
    }
  }

}

export const userClient = new UserClient();
