import { authRoutes } from "./auth.routes"
import { clubRoutes } from "./club.routes";
import { userRoutes } from "./user.routes"
import { settingsRoutes } from "./settings.routes";
import { activityRoutes } from "./activity.routes";
import { chatRoutes } from "./chat.routes";
import { notificationRoutes } from "./notification.routes";

export const routes = {
    home: '/',
    auth: authRoutes,
    user: userRoutes,
    club: clubRoutes,
    chat: chatRoutes,
    settings: settingsRoutes,
    activity: activityRoutes,
    notification: notificationRoutes,
} as const;