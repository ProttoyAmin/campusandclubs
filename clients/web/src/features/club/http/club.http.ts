import { BaseClient } from "@/settings/api";
import type {
  ClubDetail,
  ClubCreateRequest,
  PatchedClubDetailRequest,
  ClubsUpdate2Response,
  MembershipApplicationCreateRequest,
  ClubJoinRequest,
} from "@campus/api";
import type { AxiosResponse } from "axios";
import { config } from "@/settings/app/config";

export class ClubClient extends BaseClient<
  ClubDetail,
  ClubCreateRequest,
  PatchedClubDetailRequest
> {
  constructor() {
    super(config.api.v1.clubs.base);
  }

  async getClubs(): Promise<AxiosResponse> {
    const response = await this.client.get<AxiosResponse>(this.endpoint);
    return response;
  }

  async fetchClub(slug: string): Promise<AxiosResponse<ClubDetail>> {
    const response = await this.client.get<ClubDetail>(
      `${this.endpoint}${slug}`,
    );
    return response;
  }

  async updateClub(
    clubId: string,
    data: PatchedClubDetailRequest,
  ): Promise<AxiosResponse<ClubsUpdate2Response>> {
    const response = await this.client.patch<ClubsUpdate2Response>(
      `${this.endpoint}${clubId}/`,
      data,
    );
    return response;
  }

  async joinClub(
    clubId: string | number,
  ): Promise<AxiosResponse<ClubJoinRequest>> {
    const response = await this.client.post<ClubJoinRequest>(
      `${this.endpoint}${clubId}/join/`,
    );
    return response;
  }

  async leaveClub(clubId: string | number): Promise<AxiosResponse> {
    const response = await this.client.delete(
      `${this.endpoint}${clubId}/leave/`,
    );
    return response;
  }

  async applyToClub(
    clubId: string | number,
    data: MembershipApplicationCreateRequest,
  ): Promise<AxiosResponse> {
    const response = await this.client.post<MembershipApplicationCreateRequest>(
      `${this.endpoint}${clubId}/applications/`,
      data,
    );
    return response;
  }

  async withdrawFromClub(
    clubId: string | number,
    applicationId: string | number,
  ): Promise<AxiosResponse> {
    const response = await this.client.post<MembershipApplicationCreateRequest>(
      `${this.endpoint}${clubId}/applications/${applicationId}/withdraw/`,
    );
    return response;
  }
}

export const clubClient = new ClubClient();
