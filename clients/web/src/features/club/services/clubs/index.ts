import type {
  ClubCreateRequestWritable,
  ClubDetail,
  DepartmentTemplate,
  MembershipApplicationCreateRequest,
  PaginatedClubList,
  PatchedClubDetailRequest,
} from "@campus/api";
import { clubClient } from "../../http/club.http";
import { clubApplicationsService } from "./applications.service";
import { membershipService } from "./membership.service";

class ClubService {
  private clubClient = clubClient;
  public application = clubApplicationsService;
  public members = membershipService;
  constructor() {}

  async create(data: ClubCreateRequestWritable) {
    const res = await this.clubClient.createClub(data);
    return res.data;
  }

  async clubs(): Promise<PaginatedClubList> {
    const res = await this.clubClient.getClubs();
    return res.data;
  }

  async department_templates(): Promise<DepartmentTemplate[]> {
    const res = await this.clubClient.getDepartmentTemplates();
    return res.data;
  }

  async club(slug: string): Promise<ClubDetail> {
    const res = await this.clubClient.fetchClub(slug);
    return res.data;
  }

  async update(
    clubId: string,
    data: PatchedClubDetailRequest,
  ): Promise<ClubDetail> {
    const res = await this.clubClient.updateClub(clubId, data);
    return res.data;
  }

  async join(clubId: string) {
    const res = await this.clubClient.joinClub(clubId);
    if (res.status !== 200) {
      console.log("Error joining club:", res.data);
    }
    return res.data;
  }

  async leave(clubId: string) {
    const res = await this.clubClient.leaveClub(clubId);
    if (res.status !== 200) {
      console.log("Error leaving club:", res.data);
    }
    return res.data;
  }

  async apply(clubId: string, data: MembershipApplicationCreateRequest) {
    const res = await this.clubClient.applyToClub(clubId, data);
    return res.data;
  }

  async withdrawApplication(clubId: string, applicationId: string) {
    const res = await this.clubClient.withdrawFromClub(clubId, applicationId);
    return res.data;
  }
}

export const club = new ClubService();
