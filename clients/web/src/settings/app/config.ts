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
            baseUrl: VITE_PUBLIC_API_URL,
            version: "1.0.0",
            account: {
                base: `${VITE_PUBLIC_API_URL}accounts/auth/`,
                login: `${VITE_PUBLIC_API_URL}accounts/auth/login/`,
                register: `${VITE_PUBLIC_API_URL}accounts/auth/register/`,
                logout: `${VITE_PUBLIC_API_URL}accounts/auth/logout/`
            },
            clubs: {
                base: `${VITE_PUBLIC_API_URL}clubs/`,
                create: `${VITE_PUBLIC_API_URL}clubs/create/`,
                retrieve: `${VITE_PUBLIC_API_URL}clubs/retrieve/`
            },
            events: {
                base: `${VITE_PUBLIC_API_URL}events/`,
                create: `${VITE_PUBLIC_API_URL}events/create/`,
                retrieve: `${VITE_PUBLIC_API_URL}events/retrieve/`
            }
        }
    },
    // Add more configuration options as needed
    cookie: {
        access: ACCESS_TOKEN,
        refresh: REFRESH_TOKEN
    }
} as const;