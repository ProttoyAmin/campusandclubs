import { userClient } from "../api/user.client";
import { v1Client } from "@/settings/api/v1/client";
import {
  accountsAuthUsersMeRetrieve,
  
} from '@campus/api'


export class UserService {
  private userClient = userClient;
  private api = v1Client;
  public authenticated: boolean = false;

  // constructor() {
  //   this.api.setTokenGetter(async () => {
  //     return storage.token.getAccessToken() ?? null;
  //   });

  //   this.api.setUnauthorizedHandler(async () => {
  //     return storage.token.getRefreshToken();
  //   });
  // }

  async users() {
    const users = await this.userClient.grabUsers()
    return users;
  }

  async me() {
    // const response = await accountsAuthUsersMeRetrieve({
    //   client: this.api.client,
    // })
    // return response
  }

  async userByUsername(username: string) {
    const response = await this.userClient.getUser(username)
    if (response.status === 404) return null;
    return response.data
  }
}

export const account = new UserService();
