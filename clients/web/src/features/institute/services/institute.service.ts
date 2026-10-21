import type { ClaimAffiliateRequest } from "@campus/api";
import { instituteClient } from "../http/institute.http";

class InstituteService {
  private instituteClient = instituteClient;

  async list(fields?: string) {
    const res = await this.instituteClient.list_institutes(fields);
    return res.data;
  }

  // async institute(id: string) {
  //     const res = await this.instituteClient.getById(id);
  //     return res;
  // }

  // async update(id: string, data: PatchedInstituteDetailRequest) {
  //     const res = await this.instituteClient.update(id, data);
  //     return res.data;
  // }

  // async delete(id: string) {
  //     const res = await this.instituteClient.delete(id);
  //     return res.data;
  // }

  async claim_affiliation(data: ClaimAffiliateRequest) {
    const res = await this.instituteClient.claimAffiliation(data);
    return res.data;
  }

  // async verifyAffiliation(data: UserTypeRequestWritable) {
  //     const res = await this.instituteClient.verifyAffiliation(data);
  //     return res.data;
  // }
}

export const institute = new InstituteService();
