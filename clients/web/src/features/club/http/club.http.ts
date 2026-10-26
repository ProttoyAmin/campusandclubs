import { BaseClient } from "@/settings/api";
import type {
  ClubDetail,
  ClubCreateRequestWritable,
  PatchedClubDetailRequest,
  ClubsUpdate2Response,
  MembershipApplicationCreateRequest,
  ClubJoinRequest,
  PaginatedClubList,
  DepartmentTemplate,
  Post,
  Institute,
  UserMinimal,
} from "@campus/api";
import type { AxiosResponse } from "axios";
import { config } from "@/settings/app/config";
import type { JoinMode, Privacy, Scope } from "validation/club";

export type PaginaatedClubPostsResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Post[];
};


export type AnswerCreateRequest = {
  question_id: string | number;
  answer: string;
}

export type ApplicationCreateRequest = {
  message: string;
  answers: AnswerCreateRequest[];
}

export interface ClubDetailExtended extends Omit<ClubDetail, 'origin'> {
  origin: Institute;
  me_permissions: string[];
}


export type InviteResponse = {
  id: string
  invite_type: string
  link: string
  club: {
    id: string
    name: string
    origin: any
    avatar: any
    banner: any
    url: string
    slug: string
  }
  created_by: UserMinimal
}

export type InvitationResponse = {
  detail: string
  action: string
  data: InviteResponse
}

export type PaginaatedInvitesResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: InviteResponse[];
};

export type ClubPermissionsResponse = {
  club_id: string
  club_name: string
  total_permissions: number
  permissions: Array<string>
}

export type ClubRolesResponse = {
  club_id: string
  club_name: string
  total_roles: number
  roles: Array<{
    id: string
    name: string
    permissions: Array<number>
    is_default: boolean
    color: string
    user_count: number
  }>
}



export class ClubClient extends BaseClient<
  ClubDetailExtended,
  ClubCreateRequestWritable,
  PatchedClubDetailRequest
> {
  constructor() {
    super(config.api.v1.clubs.base);
  }

  async createClub(data: ClubCreateRequestWritable) {
    const response = await this.client.post<ClubDetail>(this.endpoint, data);
    return response;
  }

  async getClubs(): Promise<AxiosResponse<PaginatedClubList>> {
    const response = await this.client.get<PaginatedClubList>(this.endpoint);
    return response;
  }

  async getDepartmentTemplates(): Promise<AxiosResponse<DepartmentTemplate[]>> {
    const response = await this.client.get<DepartmentTemplate[]>(
      `${this.endpoint}department-templates/`,
    );
    return response;
  }

  async fetchClub(slug: string): Promise<AxiosResponse<ClubDetailExtended>> {
    const response = await this.client.get<ClubDetailExtended>(
      `${this.endpoint}${slug}`,
    );
    return response;
  }

  async fetchClubPosts(
    clubId: string,
    media?: "True" | "False",
  ): Promise<AxiosResponse<PaginaatedClubPostsResponse>> {
    const response = await this.client.get<PaginaatedClubPostsResponse>(
      `${this.endpoint}${clubId}/posts/`,
      { params: { media: media } },
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

  async updateClubPrivacy(clubId: string, data: { privacy: Privacy, join_mode: JoinMode }) {
    const response = await this.client.patch<ClubsUpdate2Response>(
      `${this.endpoint}${clubId}/settings/privacy-join-mode/`,
      data,
    );
    return response;
  }

  async updateClubScope(clubId: string, data: { scope: Scope }) {
    const response = await this.client.patch<ClubsUpdate2Response>(
      `${this.endpoint}${clubId}/settings/scope/`,
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
    data: ApplicationCreateRequest,
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

  async getInvites(clubId: string): Promise<AxiosResponse<PaginaatedInvitesResponse>> {
    const response = await this.client.get<PaginaatedInvitesResponse>(
      `${this.endpoint}${clubId}/invites/`,
    );
    return response;
  }

  async getInvite(code: string): Promise<AxiosResponse<InvitationResponse>> {
    const response = await this.client.get<InvitationResponse>(
      `${this.endpoint}invites/${code}/`,
    );
    return response;
  }

  async createInvite(clubId: string, payload: { invite_type: string, club_id: string }): Promise<AxiosResponse<InviteResponse>> {
    const response = await this.client.post<InviteResponse>(
      `${this.endpoint}${clubId}/invites/`, payload
    );
    return response;
  }

  async acceptInvite(clubId: string, invite_code: string) {
    const response = await this.client.patch<unknown>(
      `${this.endpoint}${clubId}/invites/${invite_code}/accept/`, { code: invite_code }
    );
    return response;
  }

  async removeInvite(clubId: string, invite_code: string) {
    const response = await this.client.delete<unknown>(
      `${this.endpoint}${clubId}/invites/${invite_code}/remove/`
    );
    return response;
  }

  async getClubPermissions(clubId: string): Promise<AxiosResponse<ClubPermissionsResponse>> {
    const response = await this.client.get<ClubPermissionsResponse>
      (
        `${this.endpoint}${clubId}/permissions/`
      );
    return response;
  }

  async getClubRoles(clubId: string): Promise<AxiosResponse<ClubRolesResponse>> {
    const response = await this.client.get<ClubRolesResponse>
      (
        `${this.endpoint}${clubId}/roles/`
      );
    return response;
  }
}

export const clubClient = new ClubClient();
