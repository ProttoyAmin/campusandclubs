import { authRoutes } from "./auth.routes"
import { clubRoutes } from "./club.routes";
import { userRoutes } from "./user.routes"

export const routes = {
    home: '/',
    auth: authRoutes,
    user: userRoutes,
    club: clubRoutes,
} as const;