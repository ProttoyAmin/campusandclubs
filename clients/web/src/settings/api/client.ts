import axios, { type AxiosInstance, type AxiosError } from "axios";
import { config } from "@/settings/app";
import { v1Client } from "./v1/client";



// API Client for making HTTP requests to the backend API
export class API {
  public v1: typeof v1Client = v1Client;
}

export const api = new API();
