import type {
    ApiClubsMembersRetrieveResponses,
    ClubJoinWritable
} from "@campus/api";
import { BaseClient } from "@/settings/api";
import { config } from "@/settings/app";

export interface RolePermissions {
    "manage:members": boolean;
    "manage:posts": boolean;
    "manage:events": boolean;
    "manage:settings": boolean;
}

export interface RoleDetails {
    id: string;
    name: string;
    permissions: RolePermissions;
    is_default: boolean;
    color: string;
    user_count: number;
}

export interface Member {
    id: string;
    user_id: string;
    username: string;
    email: string;
    profile_picture_url: string | null;
    roles: string[];
    role_details: RoleDetails[];
    role_names: string[];
    primary_role: string;
    primary_role_details: RoleDetails;
    joined_at: string; // ISO 8601 date string (e.g., "2026-07-30T03:14:01.756818Z")
}

export type ClubMembershipResponse = {
    // "200": {
    count: number;
    next: string | null;
    previous: string | null;
    results:
    {
        club_id: string;
        club_name: string;
        club_slug: string;
        club_avatar: string;
        is_member: boolean;
        is_owner: boolean;
        total_members: number;
        total_events: number;
        total_posts: number;
        members: Member[];
    }
};
// }


export class MembershipClient extends BaseClient<ClubMembershipResponse, ClubJoinWritable, unknown> {
    constructor() {
        super(config.api.v1.clubs.base);
    }

    public async list(clubId: string) {
        return this.client.get<ClubMembershipResponse>(`${this.endpoint}${clubId}/members/`);
    }
}


export const membershipClient = new MembershipClient();
