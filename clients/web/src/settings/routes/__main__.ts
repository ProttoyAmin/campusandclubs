import { authRoutes } from "./auth.routes"
import { userRoutes } from "./user.routes"

export const routes = {
    home: '/',
    auth: authRoutes,
    user: userRoutes,
} as const;