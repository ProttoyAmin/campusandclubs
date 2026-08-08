import { BaseClient } from "@/settings/api";
import type {
  ClubDetail,
  MembershipApplicationCreateRequest,
  ClubJoinRequest
} from "@campus/api";
import { AxiosError, type AxiosResponse } from "axios";
import { config } from "@/settings/app/config";

export class ClubClient extends BaseClient<AxiosResponse, any, any> {
  constructor() {
    super(config.api.v1.clubs.base);
  }

  async getClubs(): Promise<AxiosResponse> {
    try {
      const response = await this.client.get<AxiosResponse>(
        this.endpoint,
      );
      console.log("response: ", response);
      return response;
    } catch (error) {
      console.error("Get Clubs error:", (error as AxiosError).response?.data);
      throw error;
    }
  }

  async fetchClub(slug: string): Promise<AxiosResponse<ClubDetail>> {
    try {
      const response = await this.client.get<ClubDetail>(
        `${this.endpoint}${slug}`,
      );
      console.log("response: ", response);
      return response;
    } catch (error) {
      console.error("Get Club error:", (error as AxiosError).response?.data);
      throw error;
    }
  }

  async joinClub(clubId: string | number): Promise<AxiosResponse<ClubJoinRequest>> {
      const response = await this.client.post<ClubJoinRequest>(`${this.endpoint}${clubId}/join/`);
      console.log("response: ", response);
      return response;
  }

  async applyToClub(clubId: string | number, data: MembershipApplicationCreateRequest): Promise<AxiosResponse> {
    const response = await this.client.post<MembershipApplicationCreateRequest>(`${this.endpoint}${clubId}/applications/`, data);
    console.log("response: ", response);
    return response;
  }
}

export const clubClient = new ClubClient();
