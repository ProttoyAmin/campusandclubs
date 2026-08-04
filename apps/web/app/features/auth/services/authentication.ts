import type { CustomTokenObtainPairRequestWritable } from "@campus/api";
import type { RegisterRequestWritable } from "@campus/api";
import { authClient } from "../api/auth.client";

export class Authentication {
  public authenticated: boolean = false;
  private authClient = authClient;


  async register(data: RegisterRequestWritable) {
    const response = await this.authClient.register(data);
    return response.data
  }
  
}

export const authentication = new Authentication();
