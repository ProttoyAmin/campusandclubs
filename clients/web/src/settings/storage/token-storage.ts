
import { config } from "@/settings/app";
import { cookie } from "./cookie";


export class TokenStorage {
    public setAccessToken(accessToken: string) {
        cookie.set(config.cookie.access, accessToken);
    }

    public getAccessToken() {
        return cookie.get(config.cookie.access);
    }

    public removeAccessToken() {
        cookie.remove(config.cookie.access);
    }


    public setRefreshToken(refreshToken: string) {
        cookie.set(config.cookie.refresh, refreshToken);
    }

    public getRefreshToken() {
        return cookie.get(config.cookie.refresh);
    }

    public removeRefreshToken() {
        cookie.remove(config.cookie.refresh);
    }
}
