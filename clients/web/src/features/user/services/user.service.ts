import { userClient } from "../api/user.client";
import { api } from "@/settings/api";
import { config } from "@/settings/app";
import { usersList } from "@campus/api";
import type { UsersListResponse } from "@campus/api";
import { useAuth } from "@/features/auth/hooks/session.hook";
// import { client } from "@campus/api/client";
import { createClient } from "@campus/api/client";
import { v1Client } from "@/settings/api/v1/client";
import { jwtRefreshCreate } from "@campus/api";

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
      return "token refresh";
    });
  }

  async getUsers(): Promise<any> {
    // const response = await usersList({
    //   client: this.api.client,
    // });

    console.log("REFRESH FROM COOKIE: ", storage.token.getRefreshToken())

    const refreshResponse = await jwtRefreshCreate({
        client: this.api.client,
        body: {
          refresh: storage.token.getRefreshToken(),
        },
      });

      console.log('refresh response: ', refreshResponse)

    // console.log("raw", response.data);
    console.log("api: ", await authClient.verify(useAuth().getToken()));
    return null;
  }
}

export const account = new UserService();
