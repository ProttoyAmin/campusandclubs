// shared/api/base.client.ts
import { api, Client } from "./client";
import type { AxiosInstance } from "axios";
import type { ApiResponse } from "./types";
import { config } from "../app";

export abstract class BaseClient<TResult, TCreateDTO, TUpdateDTO = Partial<TCreateDTO>> {
    protected client: Client = api;
    protected authorized: boolean = false;
    protected url = config.api.v1.baseUrl

    constructor(
        protected readonly endpoint: string
    ) { }

    async getAll(params?: Record<string, unknown>): Promise<TResult[]> {
        const response = await this.client.v1.get<ApiResponse<TResult[]>>(this.url + this.endpoint, { params });
        return response.data.data as TResult[];
    }

    async getById(id: string): Promise<TResult> {
        const response = await this.client.v1.get<ApiResponse<TResult>>(`${this.url + this.endpoint}/${id}`);
        return response.data.data as TResult;
    }

    async create(data: TCreateDTO): Promise<TResult> {
        const response = await this.client.v1.post<ApiResponse<TResult>>(this.url + this.endpoint, data);
        return response.data.data as TResult;
    }

    async update(id: string, data: TUpdateDTO): Promise<TResult> {
        const response = await this.client.v1.patch<ApiResponse<TResult>>(`${this.url + this.endpoint}/${id}`, data);
        return response.data.data as TResult;
    }

    async delete(id: string): Promise<void> {
        await this.client.v1.delete(`${this.url + this.endpoint}/${id}`);
        return Promise.resolve();
    }
}