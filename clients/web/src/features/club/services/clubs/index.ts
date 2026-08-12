import type { MembershipApplicationCreateRequest } from "@campus/api";
import { clubClient } from "../../http/club.http";
import { clubApplicationsService } from "./applications.service";
import { membershipService } from "./membership.service";

class ClubService {
    private clubClient = clubClient;
    public application = clubApplicationsService;
    public members = membershipService;
    constructor() { }

    async clubs(): Promise<any> {
        const res = await this.clubClient.getClubs();
        console.log(res.data)
        return res.data;
    }

    async club(slug: string) {
        const res = await this.clubClient.fetchClub(slug);
        return res.data;
    }


    async join(clubId: string) {
        const res = await this.clubClient.joinClub(clubId);
        if (res.status !== 200) {
            console.log("Error joining club:", res.data);
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
