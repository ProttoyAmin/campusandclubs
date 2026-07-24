import { BaseClient } from "@/settings/api";

import { AxiosError, type AxiosResponse } from "axios";
import { config } from "@/settings/app/config";




export class ClubClient extends BaseClient<AxiosResponse, any, any> {
    constructor() {
        super(config.api.v1.clubs.base);
    }

    async retrieve(): Promise<AxiosResponse> {
        try {
            const response = await this.client.get<AxiosResponse>(config.api.v1.clubs.base);
            return response;
        } catch (error) {
            console.error("Retrieve error:", (error as AxiosError).response?.data);
            throw error;
        }
    }
}

export const clubClient = new ClubClient();
