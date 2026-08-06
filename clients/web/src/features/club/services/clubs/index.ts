import { clubClient } from "../../http/club.http";
// import type { CustomTokenObtainPairWritable  } from "@campus/api";
// import type { RegisterWritable } from "@campus/api";
// import { storage } from "@/settings/storage/";
// import { api } from "@/settings/api";
import { v1Client } from "@/settings/api/v1/client";
// import {
//     accountsAuthUsersUserClubsRetrieve
// } from '@campus/api'

class ClubService {
    private clubClient = clubClient;
    constructor() {}

    async clubs(): Promise<any> {
        const res = await this.clubClient.getClubs();
        console.log(res.data)
        return res.data;
    }
}


export const club = new ClubService();
