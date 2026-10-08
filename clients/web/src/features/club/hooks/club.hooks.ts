import { useMutation, useQuery } from "@tanstack/react-query";
import { club } from "../services/clubs";
import { queryClient } from "@/config/query-client";
import type { ClubJoinErrorResponse } from "@/features/club/types/club-join";
import type {
  ClubCreateRequestWritable,
  ClubDetail,
  ClubJoin,
  ClubJoinWritable,
  ClubsJoinCreateResponse,
  DepartmentTemplate,
  MembershipApplicationCreateRequest,
  PaginatedClubList,
  PatchedClubDetailRequest,
} from "@campus/api";
import type { AppError } from "@/settings/app/error";
import type { APIError } from "@/shared/types/response";
import { type ApplicationCreateRequest, type ClubDetailExtended, type PaginaatedClubPostsResponse } from "../http/club.http";
import type { JoinMode, Privacy, Scope } from "validation/club";

export const useGetClubs = () => {
  return useQuery<PaginatedClubList, AppError<{}>>({
    queryKey: ["clubs"],
    queryFn: () => {
      const response = club.clubs();
      return response;
    },
  });
};

export const useDepartmentTemplates = () => {
  return useQuery<DepartmentTemplate[], AppError<{}>>({
    queryKey: ["department-templates"],
    queryFn: () => club.department_templates(),
  });
};

export const useClub = (slug: string) => {
  return useQuery<ClubDetailExtended, AppError>({
    queryKey: ["club", slug],
    queryFn: () => {
      return club.club(slug);
    },
  });
};

export const useClubInfo = (slug: string) => {
  const posts = useQuery<PaginaatedClubPostsResponse, AppError>({
    queryKey: ["club", slug, "posts"],
    queryFn: () => {
      return club.posts(slug);
    },
  });

  const postsWithMedia = useQuery<PaginaatedClubPostsResponse, AppError>({
    queryKey: ["club", slug, "posts", "media"],
    queryFn: () => {
      return club.posts(slug, "True");
    },
  });

  const postsWithoutMedia = useQuery<PaginaatedClubPostsResponse, AppError>({
    queryKey: ["club", slug, "posts", "no-media"],
    queryFn: () => {
      return club.posts(slug, "False");
    },
  });

  return { posts, postsWithMedia, postsWithoutMedia };
};

export const useUpdateClub = (slug: string) => {
  const update = (id: string) => useMutation({
    mutationFn: (data: PatchedClubDetailRequest) => {
      const response = club.update(id, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club", slug] });
    },
    onError: (error: AppError<APIError>) => {
      console.log("Error updating club:", error.response.data);
    },
  });

  const updatePrivacyJoinMode = (id: string) => useMutation({
    mutationFn: (data: { privacy: Privacy, join_mode: JoinMode }) => {
      return club.updatePrivacy(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club", slug] });
    },
    onError: (error: AppError<APIError>) => {
      console.log("Error updating club privacy:", error.response.data);
    },
  })

  const updateScope = (id: string) => useMutation({
    mutationFn: (data: { scope: Scope }) => {
      return club.updateScope(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club", slug] });
    },
    onError: (error: AppError<APIError>) => {
      console.log("Error updating club scope:", error.response.data);
    },
  })

  const leave = (id: string) => useMutation({
    mutationFn: () => {
      return club.leave(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club", slug] });
    },
    onError: (error: AppError<APIError>) => {
      console.log("Error leaving club:", error.response.data.detail);
    },
  });

  return { update, updatePrivacyJoinMode, updateScope, leave };
};

export const useJoin = (id: string, slug: string) => {
  return useMutation<any, AppError<ClubJoinErrorResponse>, any>({
    mutationFn: () => {
      const response = club.join(id);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club", slug] });
    },
    onError: (error) => {
      console.log("Error joining club:", error.response.data.detail);
    },
  });
};

export const useApplyToClub = (id: string, slug: string) => {
  return useMutation({
    mutationFn: (data: ApplicationCreateRequest) => {
      const response = club.apply(id, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club", slug] });
    },
    onError: (error: ClubJoinErrorResponse) => {
      console.log("Error applying to club:", error.detail);
    },
  });
};

export const useWithdraw = (
  id: string,
  applicationId: string,
  slug: string,
) => {
  return useMutation({
    mutationFn: () => {
      const response = club.withdrawApplication(id, applicationId);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club", slug] });
    },
    onError: (error: ClubJoinErrorResponse) => {
      console.log("Error withdrawing application:", error.detail);
    },
  });
};

export const useClubs = () => {
  const clubs = useGetClubs();

  const create = useMutation({
    mutationFn: (data: ClubCreateRequestWritable) => {
      return club.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clubs"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (error: AppError<APIError>) => {
      console.log("Error creating club:", error.response.data.detail);
    },
  });

  return { clubs: clubs.data, create };
};
