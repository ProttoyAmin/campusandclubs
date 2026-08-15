import { useMutation, useQuery } from "@tanstack/react-query";
import { club } from "../services/clubs";
import { queryClient } from "@/config/query-client";
import type { ClubJoinErrorResponse } from "@/features/club/types/club-join";
import type { ClubDetail, MembershipApplicationCreateRequest, PatchedClubDetailRequest } from "@campus/api";
import type { AppError } from "@/settings/app/error";
import type { APIError } from "@/shared/types/response";

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

export const useUpdateClub = (slug: string, id: string) => {
  const update = useMutation({
    mutationFn: (data: PatchedClubDetailRequest) => {
      const response = club.update(id, data)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club", slug] });
    },
    onError: (error: AppError<APIError>) => {
      console.log("Error updating club:", error.response.data);
    },
  });

  const leave = useMutation({
    mutationFn: () => {
      return club.leave(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club", slug] });
    },
    onError: (error: AppError<APIError>) => {
      console.log("Error leaving club:", error.response.data.detail);
    },
  });

  return { update, leave };
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
    onError: (error: ClubJoinErrorResponse) => {
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
    onError: (error: ClubJoinErrorResponse) => {
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
    onError: (error: ClubJoinErrorResponse) => {
      console.log("Error withdrawing application:", error.detail);
    },
  });
};
