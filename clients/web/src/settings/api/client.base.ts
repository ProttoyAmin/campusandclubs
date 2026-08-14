// shared/api/base.client.ts
// import { api, Client } from "./client";
import type { AxiosError } from "axios";
import { api } from "./api";
import type { ApiResponse } from "./types";
import { AppError } from "../app/error";

export abstract class BaseClient<TResult, TCreateDTO, TUpdateDTO = Partial<TCreateDTO>> {
    protected client: typeof api.v1.client = api.v1.client;
    protected authorized: boolean = false;
    public base = api.v1

    constructor(
        protected readonly endpoint: string,
        protected readonly allauthBrowser: string | undefined = undefined
    ) {
        this.client.interceptors.response.use(
            (response) => response,
            (error: AxiosError) => {
                return Promise.reject(new AppError(error));
            },
        );
    }

    async get(url: string) {
        const response = await this.client.get(url);
        return response.data;
    }

    async getAll(params?: Record<string, unknown>): Promise<TResult[]> {
        const response = await this.client.get<ApiResponse<TResult[]>>(this.endpoint, { params });
        return response.data.data as TResult[];
    }

    async getById(id: string): Promise<TResult> {
        const response = await this.client.get<ApiResponse<TResult>>(`${this.endpoint}/${id}`);
        return response.data.data as TResult;
    }

    async create(data: TCreateDTO): Promise<TResult> {
        const response = await this.client.post<ApiResponse<TResult>>(this.endpoint, data);
        return response.data.data as TResult;
    }

    async update(id: string, data: TUpdateDTO): Promise<TResult> {
        const response = await this.client.patch<ApiResponse<TResult>>(`${this.endpoint}/${id}`, data);
        return response.data.data as TResult;
    }

    async delete(id: string): Promise<void> {
        await this.client.delete(`${this.endpoint}/${id}`);
        return Promise.resolve();
    }
}