import { useMutation, useQuery } from "@tanstack/react-query";
import type { ClaimAffiliateRequest } from "@campus/api";
import { institute } from "../services/institute.service";
import type { AppError } from "@/settings/app/error";
import type { AffiliationClaimInput } from "validation/institute";
import type { ServerError } from "@/settings/api";
import { queryClient } from "@/config/query-client";

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
    AppError<ServerError>,
    AffiliationClaimInput
  >({
    mutationFn: (data: AffiliationClaimInput) =>
      institute.claim_affiliation(data as unknown as ClaimAffiliateRequest),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users", "me"]
      })
    },
  });

  return {
    claim,
  };
};
