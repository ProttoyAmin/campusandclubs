import type {
    ApiClubsApplicationsCreateResponse,
    ApiClubsApplicationsList2Response
} from "@campus/api";
import { BaseClient } from "@/settings/api";
import { config } from "@/settings/app";


export class ClubsApplicationsClient extends BaseClient<ApiClubsApplicationsList2Response, ApiClubsApplicationsCreateResponse, unknown> {
    constructor() {
        super(config.api.v1.clubs.base);
    }

    public async list(clubId: string) {
        return this.client.get<ApiClubsApplicationsList2Response>(`${this.endpoint}${clubId}/applications/`);
    }

    public async fetchApplication(clubId: string, applicationId: string) {
        return this.client.get<ApiClubsApplicationsCreateResponse>(`${this.endpoint}${clubId}/applications/${applicationId}/`);
    }
    public async approveApplication(clubId: string, applicationId: string) {
        return this.client.post<ApiClubsApplicationsCreateResponse>(`${this.endpoint}${clubId}/applications/${applicationId}/approve/`, {});
    }
    public async rejectApplication(clubId: string, applicationId: string) {
        return this.client.post<ApiClubsApplicationsCreateResponse>(`${this.endpoint}${clubId}/applications/${applicationId}/reject/`, {});
    }
}


export const applicationClient = new ClubsApplicationsClient();
