import { NotificationHttp } from "../http/notifications.http";

export class NotificationService {
    private notificationHttp = new NotificationHttp();

    async list() {
        const res = await this.notificationHttp.getNotifications();
        return res.data;
    }
}

export const notifications = new NotificationService();