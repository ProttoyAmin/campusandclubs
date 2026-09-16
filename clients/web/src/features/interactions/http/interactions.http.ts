import { BaseClient } from "@/settings/api";
import type { AxiosResponse } from "axios";
import { config } from "@/settings/app/config";


class InteractionHttp extends BaseClient<any, any, any> {
    constructor() {
        super(config.api.v1.interactions.base);
    }

    public async commentReplies(comment_id: string) {
        const res = await this.client.get(`${this.endpoint}comments/${comment_id}/replies/`);
        return res.data;
    }

    async likePost(data: any): Promise<AxiosResponse> {
        const response = await this.client.post(`${this.endpoint}like/`, data);
        return response;
    }
}

export const interactionClient = new InteractionHttp()