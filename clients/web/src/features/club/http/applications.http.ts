import type {
  ClubsApplicationsCreateResponse,
  ClubsApplicationsList2Response,
  MembershipApplicationCreate,
  UserMinimal,
} from "@campus/api";
import { BaseClient } from "@/settings/api";
import { config } from "@/settings/app";


export type Applications = MembershipApplicationCreate & {
  readonly reviewed_by: UserMinimal
  readonly created_at: string
}

export class ClubsApplicationsClient extends BaseClient<
  ClubsApplicationsList2Response,
  ClubsApplicationsCreateResponse,
  unknown
> {
  constructor() {
    super(config.api.v1.clubs.base);
  }

  public async list(clubId: string) {
    return this.client.get<Applications[]>(
      `${this.endpoint}${clubId}/applications/`,
    );
  }

  public async getApplicationForms(clubId: string) {
    return this.client.get(
      `${this.endpoint}${clubId}/application-forms/`,
    );
  }

  public async createApplicationForm(clubId: string, data: any) {
    return this.client.post(
      `${this.endpoint}${clubId}/application-forms/`,
      data,
    );
  }

  public async fetchApplication(clubId: string, applicationId: string) {
    return this.client.get<ClubsApplicationsCreateResponse>(
      `${this.endpoint}${clubId}/applications/${applicationId}/`,
    );
  }
  public async approveApplication(clubId: string, applicationId: string) {
    return this.client.post<ClubsApplicationsCreateResponse>(
      `${this.endpoint}${clubId}/applications/${applicationId}/approve/`,
      {},
    );
  }

  public async bulkApplicationsApprove(clubId: string, application_ids: string[]) {
    return this.client.post<ClubsApplicationsCreateResponse>(
      `${this.endpoint}${clubId}/applications/bulk-approve/`,
      { application_ids },
    );
  }

  public async bulkApplicationsReject(clubId: string, application_ids: string[]) {
    return this.client.post<ClubsApplicationsCreateResponse>(
      `${this.endpoint}${clubId}/applications/bulk-reject/`,
      { application_ids },
    );
  }

  public async rejectApplication(clubId: string, applicationId: string) {
    return this.client.post<ClubsApplicationsCreateResponse>(
      `${this.endpoint}${clubId}/applications/${applicationId}/reject/`,
      {},
    );
  }
}

export const applicationClient = new ClubsApplicationsClient();
