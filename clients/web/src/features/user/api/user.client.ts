import { BaseClient } from "@/settings/api/";
import type { ApiResponse } from "@/settings/api/";
import type {
  AllRetrieveResponse,
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

  async grabUsers(): Promise<AxiosResponse<AllRetrieveResponse>> {
    try {
      const response = await this.client.v1.get<
        AllRetrieveResponse>
      (this.endpoint + "all/");
      console.log("RESPONSE: ", response)
      return response;     // TODO: Handle the response data type properly
    } catch (err) {
      console.error("Grab users error:", err);
      console.error("Grab users error:", (err as AxiosError).response?.data);
      throw err;
    }
  }

}

export const userClient = new UserClient();
