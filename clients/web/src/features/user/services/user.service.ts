import { userClient } from "../api/user.client";
import { api } from "@/settings/api";
import { config } from "@/settings/app";
import type { ListUsersResponse } from "@campus/api";
import { useAuth } from "@/features/auth/hooks/session.hook";
// import { client } from "@campus/api/client";
import { createClient } from "@campus/api/client";
import { v1Client } from "@/settings/api/v1/client";
import { accountsAuthJwtRefreshCreate, accountsAuthUsersUserRetrieve } from "@campus/api";
import {
  listUsers,
  accountsAuthUsersMeRetrieve,
  
} from '@campus/api'

// export const client: Client = new Client();

// const client = createClient({
//   baseURL: config.api.v1.raw,
//   headers: {
//     Authorization: `Bearer ${useAuth().getToken()}`
//   }
// })
// client.buildUrl({
//   path: { "users": "list" },
//   url: config.api.v1.raw
// })

import { authClient } from "@/features/auth/api/auth.client";
import { storage } from "@/settings/storage";

// Fclient.connect({
//   headers: {
//     Authorization: `Bearer ${useAuth().getToken()}`
//   },
//   url: config.api.v1.raw
// })

console.log(console.log(v1Client.client.getConfig()));

export class UserService {
  private api = v1Client;
  public authenticated: boolean = false;

  constructor() {
    this.api.setTokenGetter(async () => {
      return storage.token.getAccessToken() ?? null;
    });

    this.api.setUnauthorizedHandler(async () => {
      return storage.token.getAccessToken();
    });
  }

  async getUsers(): Promise<ListUsersResponse> {
    const response = await listUsers({
      client: this.api.client
    })
    return response.data;
  }

  async getMe() {
    const response = await accountsAuthUsersMeRetrieve({
      client: this.api.client,
    })
    return response
  }

  async getUserByUsername(username: string) {
    const response = await accountsAuthUsersUserRetrieve({
      client: this.api.client,
      path: {
        username: username
      }
    })
    console.log(response)
    return response.data
  }
}

export const account = new UserService();
