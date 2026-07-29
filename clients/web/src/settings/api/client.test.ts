// shared/api/base.client.ts
import { api, Client } from "./client";
import type { AxiosInstance } from "axios";
import type { ApiResponse } from "./types";
import type { AxiosResponse } from "axios";
import { V1Client, v1Client } from "./v1/client";

type Envelope<T> = { 200: T };

export abstract class TestBaseClient<
  TResult,
  TCreateDTO,
  TUpdateDTO = Partial<TCreateDTO>,
> {
  protected testClient: V1Client = v1Client;
  protected authorized: boolean = false;
  protected accounts = "/accounts/auth/";

  constructor(protected readonly endpoint: string) {}

  async getAll(params?: Record<string, unknown>): Promise<TResult[]> {
    const { data, error } = await this.testClient.client.get<
      Envelope<ApiResponse<TResult[]>>
    >({
      url: this.endpoint,
      query: params,
    });
    if (error) throw error;
    return data.data;
  }

  async getById(id: string): Promise<TResult> {
    const { data, error } = await this.testClient.client.get<
      Envelope<ApiResponse<TResult>>
    >({
      url: `${this.endpoint}/${id}`,
    });
    if (error) throw error;
    return data.data;
  }

  async create(payload: TCreateDTO): Promise<TResult> {
    const { data, error } = await this.testClient.client.post<
      Envelope<ApiResponse<TResult>>
    >({
      url: this.endpoint,
      body: payload,
    });
    if (error) throw error;
    return data.data;
  }

  async update(id: string, payload: TUpdateDTO): Promise<TResult> {
    const { data, error } = await this.testClient.client.patch<
      Envelope<ApiResponse<TResult>>
    >({
      url: `${this.endpoint}/${id}`,
      body: payload,
    });
    if (error) throw error;
    return data.data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.testClient.client.delete<Envelope<void>>({
      url: `${this.endpoint}/${id}`,
    });
    if (error) throw error;
  }
}
