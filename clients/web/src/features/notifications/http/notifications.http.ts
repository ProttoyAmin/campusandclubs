import { BaseClient } from "@/settings/api";
import { config } from "@/settings/app/config";
import {

} from "@campus/api";


export type Notification = {
    id: string
    verb: string
    description: string
    is_read: boolean
    is_seen: boolean
    primary_actor: {
        id: string
        username: string
        first_name: string
        last_name: string
        avatar: string
    }
    actor_count: number
    target_ct: string
    target_preview: unknown;
    target_type: string;
    target_id: string
    notification_url: string
    message: string
    created_at: string
}

export type NotificationsPaginated = {
    count: number
    next: string
    previous: any
    results: Array<Notification>
}

export class NotificationHttp extends BaseClient<NotificationsPaginated, any, any> {
    constructor() {
        super(config.api.v1.notification.base);
    }

    async getNotifications() {
        const response = await this.client.get<NotificationsPaginated>(this.endpoint);
        return response;
    }
}