export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: {
    page: number;
    total: number;
  };
}

export interface ServerError {
  errors: {
    message: string;
    code: string;
    param: string;
  }[];
}