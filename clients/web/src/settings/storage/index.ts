import { CookieService } from "./cookie";
import { TokenStorage } from "./token-storage";

export class Storage {
    public token: TokenStorage = new TokenStorage();
    public cookie: CookieService = new CookieService();
}



export const storage = new Storage();