import { userClient } from "../api/user.client";

export class UserService {
  private client = userClient;

  async users() {
    const response = await this.client.grabUsers();
    return response;
  }

  async profile(username: string) {
    console.log("client =", this.client);
    console.log("username =", username);
    const response = await this.client.grabUser(username);
    return response;
  }
}

export const account = new UserService();
