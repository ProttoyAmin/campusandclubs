import { type RouteConfig, index, route } from "@react-router/dev/routes";


export default [
    route('/', './routes/home.tsx'),
    route('/@/auth/sign-up', './routes/public/auth/sign-up.route.tsx'),
    route('/@/auth/sign-in', './routes/public/auth/sign-in.tsx'),

    
    route('/@/u/:username', './routes/public/user/profile.tsx'),
] satisfies RouteConfig;
