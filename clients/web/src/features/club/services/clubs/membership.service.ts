
import { membershipClient } from "../../http/membership.http";


class ClubMembershipService {
    private membershipClient = membershipClient;
    constructor() {}

    async list(clubId: string) {
        const response = await this.membershipClient.list(clubId);
        return response.data;
    }
}


export const membershipService = new ClubMembershipService();
