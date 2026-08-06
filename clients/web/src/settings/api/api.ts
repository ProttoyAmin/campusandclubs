import { v1Client } from './v1/client';


export class API {
    public v1: typeof v1Client = v1Client;
}

export const api = new API()