import { useMutation, useQuery } from "@tanstack/react-query";
import type { UserTypeRequestWritable } from "@campus/api";
import { institute } from "../services/institute.service";

export const useInstitutes = (fields?: string) => {
  const institutes = useQuery({
    queryKey: ["institutes"],
    queryFn: () => institute.list(fields),
  });
  return { institutes };
};

export const useAffilication = () => {
  const claim = useMutation({
    mutationFn: (data: UserTypeRequestWritable) =>
      institute.claim_affiliation(data),
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
