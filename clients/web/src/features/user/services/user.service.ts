import { userClient } from "../api/user.client";
import { api } from "@/settings/api";
import { config } from "@/settings/app";
import { usersList, client } from "@campus/api";
import type {
    UsersListResponse
} from "@campus/api";
import { useAuth } from "@/features/auth/hooks/session.hook";

client.setConfig({
  baseUrl: config.api.v1.raw,
  headers: {
    Authorization: `Bearer ${useAuth().getToken()}`
  }
})

// client.connect({
//   headers: {
//     Authorization: `Bearer ${useAuth().getToken()}`
//   },
//   url: config.api.v1.raw
// })

console.log(console.log(client.getConfig()))


export class UserService {
  async getUsers(): Promise<UsersListResponse> {
    const response = await usersList();
    console.log("raw", response.request.body)
    return response.data;
  }
}




export const account = new UserService();
