import { BaseClient } from "@/settings/api";
import type {
  InstitutesListResponse,
  ClaimAffiliateRequest,
  PatchedInstituteDetailRequest,
} from "@campus/api";
import type { AxiosResponse } from "axios";
import { config } from "@/settings/app/config";

class InstituteClient extends BaseClient<
  InstitutesListResponse,
  any,
  PatchedInstituteDetailRequest
> {
  constructor() {
    super(config.api.v1.institutes.base);
  }

  //   use comma separated valeus for fields. eg. code,name,etc
  async list_institutes(
    fields?: string,
  ): Promise<AxiosResponse<InstitutesListResponse>> {
    const response = await this.client.get<InstitutesListResponse>(
      `${this.endpoint}?fields=${fields}`,
    );
    return response;
  }

  async claimAffiliation(data: ClaimAffiliateRequest): Promise<AxiosResponse> {
    const response = await this.client.post(`${this.endpoint}claim/`, data);
    return response;
  }

  // async verifyAffiliation(data: UserTypeRequestWritable): Promise<AxiosResponse> {
  //     const response = await this.client.post(`${this.endpoint}verify/`, data);
  //     return response;
  // }
}

export const instituteClient = new InstituteClient();
