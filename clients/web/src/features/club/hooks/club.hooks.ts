import { useMutation, useQuery } from "@tanstack/react-query";
import { club } from "../services/clubs";
import { queryClient } from "@/config/query-client";
import type { JoinErrorResponse } from "@/features/user/api/types";
import type { ClubDetail, MembershipApplicationCreateRequest } from "@campus/api";
import type { AppError } from "@/settings/app/error";


export const useGetClubs = () => {
  return useQuery({
    queryKey: ["clubs"],
    queryFn: () => {
      const response = club.clubs()
      return response
    },
  });
};

export const useClub = (slug: string) => {
  return useQuery<ClubDetail, AppError>({
    queryKey: ["club", slug],
    queryFn: () => {
      return club.club(slug)
    },
  });
};

export const useJoin = (id: string, slug: string) => {
  return useMutation({
    mutationFn: () => {
      const response = club.join(id)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club", slug] });
    },
    onError: (error: JoinErrorResponse) => {
      console.log("Error joining club:", error.detail);
    },
  });
};

export const useApplyToClub = (id: string, slug: string) => {
  return useMutation({
    mutationFn: (data: MembershipApplicationCreateRequest) => {
      const response = club.apply(id, data)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club", slug] });
    },
    onError: (error: JoinErrorResponse) => {
      console.log("Error applying to club:", error.detail);
    },
  });
};

export const useWithdraw = (id: string, applicationId: string, slug: string) => {
  return useMutation({
    mutationFn: () => {
      const response = club.withdrawApplication(id, applicationId)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club", slug] });
    },
    onError: (error: JoinErrorResponse) => {
      console.log("Error withdrawing application:", error.detail);
    },
  });
};
