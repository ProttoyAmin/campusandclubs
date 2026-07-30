import { clubClient } from "../../http/club.http";
// import type { CustomTokenObtainPairWritable  } from "@campus/api";
// import type { RegisterWritable } from "@campus/api";
// import { storage } from "@/settings/storage/";
// import { api } from "@/settings/api";
import { v1Client } from "@/settings/api/v1/client";
import {
    accountsAuthUsersUserClubsRetrieve
} from '@campus/api'

class ClubService {
    private clubClient = clubClient;
    private api = v1Client;
    constructor() {}

    async getClubs(): Promise<any> {
        const response = await accountsAuthUsersUserClubsRetrieve({
            client: this.api.client,
            path: {
                username: 'prottoy'
            }
        });
        console.log(response.data)
        return response.data;
    }
}


export const club = new ClubService();
