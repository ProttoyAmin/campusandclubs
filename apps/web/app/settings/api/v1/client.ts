import axios from "axios";
import type {
    AxiosInstance,
    AxiosResponse,
    AxiosError
} from "axios";
import { config } from "~/settings/app";

declare module "axios" {
  export interface AxiosRequestConfig {
    _retry?: boolean;
  }
}


type TokenGetter = () => Promise<string | null>;

export class V1 {
    private static instance: V1;
    public client: AxiosInstance;
    private getToken: TokenGetter | null = null;

    private constructor() {
        this.client = axios.create({
            baseURL: config.api.v1.baseUrl,
            withCredentials: true,
        });
    }

    public static getInstance(): V1 {
        if (!V1.instance) V1.instance = new V1();
        return V1.instance;
    }
}

export const clientV1 = V1.getInstance();
