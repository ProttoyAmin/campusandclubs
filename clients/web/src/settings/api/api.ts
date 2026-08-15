import { v1Client } from './v1/client';
import { v1PublicClient } from './v1/public.client';


export class API {
    public v1: typeof v1Client = v1Client;
    public v1Public: typeof v1PublicClient = v1PublicClient;
}

export const api = new API()