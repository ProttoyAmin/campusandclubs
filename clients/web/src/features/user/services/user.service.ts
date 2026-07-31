import { userClient } from "../api/user.client";
import { api } from "@/settings/api";
import { config } from "@/settings/app";
import type { AccountsAuthUsersRetrieveResponse, ListUsersResponse } from "@campus/api";
import { useAuth } from "@/features/auth/hooks/session.hook";
// import { client } from "@campus/api/client";
import { createClient } from "@campus/api/client";
import { v1Client } from "@/settings/api/v1/client";
import { accountsAuthJwtRefreshCreate, accountsAuthUsersUserRetrieve } from "@campus/api";
import {
  listUsers,
  accountsAuthUsersMeRetrieve,
  
} from '@campus/api'

import { storage } from "@/settings/storage";

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
    const response = await accountsAuthUsersMeRetrieve({
      client: this.api.client,
    })
    return response
  }

  async userByUsername(username: string) {
    const response = await this.userClient.getUser(username)
    // const response = await accountsAuthUsersUserRetrieve({
    //   client: this.api.client,
    //   path: {
    //     username: username
    //   }
    // })
    // console.log(response)
    return response.data
  }
}

export const account = new UserService();
