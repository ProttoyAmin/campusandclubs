
import { applicationClient } from "../../http/applications.http";


export class ClubApplicationsService {
    private applicationClient = applicationClient;
    constructor() { }

    async applications(clubId: string) {
        const response = await this.applicationClient.list(clubId);
        return response.data;
    }

    async application(clubId: string, applicationID: string) {
        const response = await this.applicationClient.fetchApplication(clubId, applicationID);
        return response.data;
    }

    async approve(clubId: string, applicationID: string) {
        const response = await this.applicationClient.approveApplication(clubId, applicationID);
        return response.data;
    }

    async bulkApplicationsApprove(clubId: string, application_ids: string[]) {
        const response = await this.applicationClient.bulkApplicationsApprove(clubId, application_ids);
        return response.data;
    }

    async bulkApplicationsReject(clubId: string, application_ids: string[]) {
        const response = await this.applicationClient.bulkApplicationsReject(clubId, application_ids);
        return response.data;
    }

    async reject(clubId: string, applicationID: string) {
        const response = await this.applicationClient.rejectApplication(clubId, applicationID);
        return response.data;
    }


}


export const clubApplicationsService = new ClubApplicationsService();
