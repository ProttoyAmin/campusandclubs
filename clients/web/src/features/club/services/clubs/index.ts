import { clubClient } from "../../http/club.http";
// import type { CustomTokenObtainPairWritable  } from "@campus/api";
// import type { RegisterWritable } from "@campus/api";
// import { storage } from "@/settings/storage/";
// import { api } from "@/settings/api";

class ClubService {
    private clubClient = clubClient;
    constructor() {}

    async getClubs(): Promise<any> {
        const response = await this.clubClient.retrieve();
        console.log(response.data)
        return response.data;
    }
}


export const club = new ClubService();
