import { connectionClient } from "../http/connection.http";

class ActivityService {
  connection = connectionClient;

  async toggleFollow(userId: string) {
    return this.connection.toggleFollow(userId);
  }

  async getFollowers(userId: string) {
    return this.connection.getFollowers(userId);
  }

  async getFollowing(userId: string) {
    return this.connection.getFollowing(userId);
  }

  async removeFollower(userId: string) {
    return this.connection.removeFollower(userId);
  }

  async getRequests() {
    return this.connection.getRequests();
  }

  async acceptRequest(userId: string) {
    return this.connection.acceptRequest(userId);
  }

  async rejectRequest(userId: string) {
    return this.connection.rejectRequest(userId);
  }

  async blockUser(userId: string) {
    return this.connection.blockUser(userId);
  }

  async unblockUser(userId: string) {
    return this.connection.unblockUser(userId);
  }

  async getBlockedUsers() {
    return this.connection.getBlockedUsers();
  }
}

export const activityService = new ActivityService();
