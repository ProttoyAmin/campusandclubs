import type { AxiosError } from "axios";

export class AppError<T = unknown> extends Error {
    status?: number;
    response?: {
        data: T;
        status: number;
        headers: unknown;
    };
    request?: unknown;
    config?: unknown;

    constructor(err: AxiosError<T>) {
        super(err.message);
        this.name = "AppError";
        this.status = err.response?.status;
        this.response = err.response
            ? {
                data: err.response.data,
                status: err.response.status,
                headers: err.response.headers,
            }
            : undefined;
        this.request = err.request;
        this.config = err.config;
    }
}