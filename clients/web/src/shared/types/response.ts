export interface APIError {
    detail: string;
}

export interface APIResponse<T = any> {
    success: boolean;
    message?: string;
    data: T;
}

export type ApiResponse<T = any> = APIResponse<T>;