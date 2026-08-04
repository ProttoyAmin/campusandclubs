import { clientV1 } from "./v1/client"


export class API {
    public v1: typeof clientV1 = clientV1;
}


export const api = new API();
