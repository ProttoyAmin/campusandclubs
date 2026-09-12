import { BaseClient } from "@/settings/api";
import type { AxiosResponse } from "axios";
import { config } from "@/settings/app/config";

class ConnectionClient extends BaseClient<any, any, any> {
  constructor() {
    super(config.api.v1.connections.base);
  }

  async toggleFollow(userId: string): Promise<AxiosResponse<any>> {
    return this.client.post(`${this.endpoint}${userId}/toggle/`);
  }

  async getFollowers(userId: string): Promise<AxiosResponse<any>> {
    return this.client.get(`${this.endpoint}${userId}/followers/`);
  }

  async getFollowing(userId: string): Promise<AxiosResponse<any>> {
    return this.client.get(`${this.endpoint}${userId}/following/`);
  }

  async removeFollower(userId: string): Promise<AxiosResponse<any>> {
    return this.client.delete(`${this.endpoint}${userId}/remove/`);
  }

  async getRequests(): Promise<AxiosResponse<any>> {
    return this.client.get(`${this.endpoint}requests/`);
  }

  async acceptRequest(userId: string): Promise<AxiosResponse<any>> {
    return this.client.post(`${this.endpoint}requests/${userId}/accept/`);
  }

  async rejectRequest(userId: string): Promise<AxiosResponse<any>> {
    return this.client.post(`${this.endpoint}${userId}/reject/`);
  }

  async blockUser(userId: string): Promise<AxiosResponse<any>> {
    return this.client.post(`${this.endpoint}${userId}/block/`);
  }

  async unblockUser(userId: string): Promise<AxiosResponse<any>> {
    return this.client.delete(`${this.endpoint}${userId}/unblock/`);
  }

  async getBlockedUsers(): Promise<AxiosResponse<any>> {
    return this.client.get(`${this.endpoint}blocked/`);
  }
}

export const connectionClient = new ConnectionClient();
