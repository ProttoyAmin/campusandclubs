import { BaseClient } from "~/settings/api/client.base";
import { api } from "~/settings/api/";
import type { AxiosError, AxiosResponse } from "axios";
import { config } from "~/settings/app";

import type {
  RegisterWritable,
  RegisterResponse,
  TokenRefresh,
} from "@campus/api";

export class AuthClient extends BaseClient<AxiosResponse, RegisterWritable> {
  constructor() {
    super(config.api.v1.account.base);
  }

  async register(
    data: RegisterWritable,
  ): Promise<AxiosResponse<RegisterResponse>> {
    try {
      const response = await this.client.post<RegisterResponse>(
        `${this.endpoint}register/`,
        data,
      );
      return response;
    } catch (err: unknown) {
      console.error("Register error:", (err as AxiosError).response?.data);
      throw err as AxiosError;
    }
  }
}


export const authClient = new AuthClient();
