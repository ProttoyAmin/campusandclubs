import { userClient } from "../api/user.client";

export class UserService {
  private userClient = userClient;
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
    return response.data;
  }

  async feed() {
    const response = await this.userClient.fetchFeed()
    return response.data;
  }
}

export const account = new UserService();
