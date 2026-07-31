
import { config } from "@/settings/app";
import { cookie } from "./cookie";


export class TokenStorage {
    public setAccessToken(accessToken: string) {
        this.removeAccessToken()
        cookie.set(config.cookie.access, accessToken, {
            secure: true,
            sameSite: 'strict' as const,
            httpOnly: true,
        });
    }

    public getAccessToken() {
        return cookie.get(config.cookie.access);
    }

    public removeAccessToken() {
        cookie.remove(config.cookie.access);
    }


    public setRefreshToken(refreshToken: string) {
        this.removeRefreshToken()
        cookie.set(config.cookie.refresh, refreshToken, {
            secure: true,
            sameSite: 'strict' as const,
            httpOnly: true,
        });
    }

    public getRefreshToken() {
        return cookie.get(config.cookie.refresh);
    }

    public removeRefreshToken() {
        cookie.remove(config.cookie.refresh);
    }
}
