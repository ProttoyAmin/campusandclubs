
import { applicationClient } from "../../http/applications.http";


export class ClubApplicationsService {
    private applicationClient = applicationClient;
    constructor() {}

    async applications(clubId: string) {
        const response = await this.applicationClient.list(clubId);
        return response.data;
    }
}


export const clubApplicationsService = new ClubApplicationsService();
