import type { AxiosResponse } from "axios";
import { interactionClient } from "../http/interactions.http";

class InteractionService {
    constructor() { }

    public async commentReplies(comment_id: string) {
        const res = await interactionClient.commentReplies(comment_id);
        return res;
    }

    public async likePost(data: any): Promise<AxiosResponse> {
        const response = await interactionClient.likePost(data);
        return response;
    }
}

export const interactionService = new InteractionService()