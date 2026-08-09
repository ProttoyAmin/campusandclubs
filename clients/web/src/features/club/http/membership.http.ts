import type {
    ClubsMembersRetrieveResponses,
    ClubJoinWritable
} from "@campus/api";
import { BaseClient } from "@/settings/api";
import { config } from "@/settings/app";


export class MembershipClient extends BaseClient<ClubsMembersRetrieveResponses, ClubJoinWritable, unknown> {
    constructor() {
        super(config.api.v1.clubs.base);
    }

    public async list(clubId: string) {
        return this.client.get<ClubsMembersRetrieveResponses>(`${this.endpoint}${clubId}/members/`);
    }
}


export const membershipClient = new MembershipClient();
