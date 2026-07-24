import { Cookies } from "typescript-cookie";

export interface CookieAttributes {
    path?: string;
    domain?: string;
    expires?: number | Date;
    sameSite?: 'strict' | 'Strict' | 'lax' | 'Lax' | 'none' | 'None';
    secure?: boolean;
    [property: string]: any;
}

export class CookieService {
    public set(name: string, value: string, options: CookieAttributes = {}) {
        return Cookies.set(name, value, options);
    }

    public get(name: string): string | undefined {
        return Cookies.get(name) as string;
    }

    public remove(name: string, options: CookieAttributes = {}) {
        return Cookies.remove(name, options);
    }
    
}

export const cookie = new CookieService();
