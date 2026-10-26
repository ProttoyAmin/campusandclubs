
import { membershipClient } from "../../http/membership.http";


class ClubMembershipService {
    private membershipClient = membershipClient;
    constructor() { }

    async list(clubId: string) {
        const response = await this.membershipClient.list(clubId);
        return response.data;
    }

    async member(clubId: string, memberId: string) {
        const response = await this.membershipClient.memberDetails(clubId, memberId);
        return response.data;
    }

    async search(clubId: string) {
        const response = await this.membershipClient.searchMembers(clubId);
        return response.data;
    }
}


export const membershipService = new ClubMembershipService();
