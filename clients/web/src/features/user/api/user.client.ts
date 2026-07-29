import { BaseClient } from "@/settings/api/";
import type { ApiResponse } from "@/settings/api/";
import type {
  AllRetrieveResponses,
  UsersActivationCreateResponse,
} from "@campus/api";
import { AxiosError, type AxiosResponse } from "axios";

export class UserClient extends BaseClient<
  ApiResponse,
  AllRetrieveResponses,
  UsersActivationCreateResponse
> {
  constructor() {
    super("/accounts/auth/");
  }

  async grabUsers(): Promise<AllRetrieveResponses> {
    try {
      const response = await this.client.v1.get<
        AllRetrieveResponses>
      (this.endpoint + "all/");
      return response as AllRetrieveResponses | any;     // TODO: Handle the response data type properly
    } catch (err) {
      console.error("Grab users error:", (err as AxiosError).response?.data);
      throw err;
    }
  }

}

export const userClient = new UserClient();
