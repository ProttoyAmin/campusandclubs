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
            suffix: "/api/v1/",
            baseUrl: VITE_PUBLIC_API_URL + "/api/v1/",
            version: "1.0.0",
            account: {
                base: `accounts/auth/`,
                login: `accounts/auth/login/`,
                register: `accounts/auth/register/`,
                logout: `accounts/auth/logout/`
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
    },
    theme: {
        default: "system",
        options: ["dark", "light", "system"],
        key: "theme"
    }
} as const;