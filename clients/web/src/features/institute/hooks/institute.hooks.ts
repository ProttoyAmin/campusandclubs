import { useMutation, useQuery } from "@tanstack/react-query";
import type { ClaimAffiliateRequest } from "@campus/api";
import { institute } from "../services/institute.service";
import type { AppError } from "@/settings/app/error";
import type { AffiliationClaimInput } from "validation/institute";

export const useInstitutes = (fields?: string) => {
  const institutes = useQuery({
    queryKey: ["institutes"],
    queryFn: () => institute.list(fields),
  });
  return { institutes };
};

export const useAffiliation = () => {
  const claim = useMutation<
    AffiliationClaimInput,
    AppError<{
      email?: string[];
      role?: string[];
      institute?: string[];
      password?: string[];
    }>,
    AffiliationClaimInput
  >({
    mutationFn: (data: AffiliationClaimInput) =>
      institute.claim_affiliation(data as unknown as ClaimAffiliateRequest),
    onSuccess: () => {
      console.log("Affiliation claimed successfully!");
    },
    onError: (error) => {
      console.log("Failed to claim affiliation", error);
    },
  });

  return {
    claim,
  };
};
