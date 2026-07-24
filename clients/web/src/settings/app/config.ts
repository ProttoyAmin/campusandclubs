import {
    PORT,
    VITE_PUBLIC_API_URL
} from "./env";

import {
    ACCESS_TOKEN,
    REFRESH_TOKEN
} from "./constants";


export const config = {
    port: PORT,
    api: {
        v1: {
            name: 'v1',
            raw: VITE_PUBLIC_API_URL,
            baseUrl: VITE_PUBLIC_API_URL + '/api/v1/',
            version: "1.0.0",
            account: {
                base: '/accounts/auth/',
                login: '/login/',
                register: '/register/',
                logout: '/logout/'
            },
            clubs: {
                base: '/clubs/',
                create: '/create/',
                retrieve: '/retrieve/'
            },
            events: {
                base: '/events/',
                create: '/create/',
                retrieve: '/retrieve/'
            }
        }
    },
    // Add more configuration options as needed
    cookie: {
        access: ACCESS_TOKEN,
        refresh: REFRESH_TOKEN
    }
} as const;