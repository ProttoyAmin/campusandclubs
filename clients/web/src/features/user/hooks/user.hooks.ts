import { useMutation, useQuery } from "@tanstack/react-query";
import { accounts } from "../services/account.service";
import type {
  AccountsAuthUsersSetPasswordCreateResponse,
  PatchedUserProfileRequest,
  SetPasswordRequest,
  UserEmail,
} from "@campus/api";
import { queryClient } from "@/config/query-client";
import type { AppError } from "@/settings/app/error";
import type { AllauthError } from "@/features/auth/api/auth.client";
import type { PaginaatedClubPostsResponse } from "@/features/club/http/club.http";
import type { AxiosResponse } from "axios";
import type { ChangePasswordSchemaType } from "validation/auth";

export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => {
      return accounts.users();
    },
  });
};

export const useAccount = () => {
  const addEmail = useMutation<UserEmail, AppError<AllauthError>, string>({
    mutationFn: (email: string) => {
      return accounts.add_email(email);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails"] });
    },
  });

  const verifyAccountEmail = useMutation<
    AxiosResponse<void>,
    AppError<AllauthError>,
    string
  >({
    mutationFn: (key: string) => {
      return accounts.verify_email(key);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails"] });
    },
  });

  const resendVerification = useMutation<
    AxiosResponse<void>,
    AppError<AllauthError>,
    void
  >({
    mutationFn: () => {
      return accounts.resend_email_verification();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails"] });
    },
  });

  const deleteEmail = useMutation<UserEmail[], AppError<AllauthError>, string>({
    mutationFn: (email: string) => {
      return accounts.delete_email(email);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails"] });
    },
  });

  const requestEmailVerification = useMutation<
    UserEmail,
    AppError<AllauthError>,
    string
  >({
    mutationFn: (email: string) => {
      return accounts.request_email_verification(email);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails"] });
    },
  });

  const changePrimaryEmail = useMutation<
    UserEmail[],
    AppError<AllauthError>,
    string
  >({
    mutationFn: (email: string) => {
      return accounts.change_primary_email(email);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails"] });
    },
  });

  const passwordChange = useMutation<
    void,
    AppError<AllauthError>,
    ChangePasswordSchemaType
  >({
    mutationFn: (data) => {
      return accounts.password_change(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails"] });
    },
  });

  return {
    addEmail,
    verifyAccountEmail,
    resendVerification,
    deleteEmail,
    requestEmailVerification,
    changePrimaryEmail,
    passwordChange,
  };
};

export const useEmails = () => {
  return useQuery<UserEmail[]>({
    queryKey: ["emails"],
    queryFn: () => {
      return accounts.user.emails();
    },
  });
};

export const useAffiliations = () => {
  return useQuery({
    queryKey: ["affiliations"],
    queryFn: () => {
      return accounts.user.affiliations();
    },
  });
};

export const useProfile = (username?: string) => {
  const emails = useEmails();
  const affiliations = useAffiliations();
  const me = useMe();

  const clubs = useQuery({
    queryKey: ["me", "clubs"],
    queryFn: () => {
      return accounts.user.clubs();
    },
  });

  const updateProfile = useMutation({
    mutationFn: (data: PatchedUserProfileRequest) => {
      return accounts.user.update(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      if (username) {
        queryClient.invalidateQueries({ queryKey: ["users", username] });
      }
    },
  });

  return {
    updateProfile,
    emails,
    affiliations,
    me,
    clubs,
  };
};

export const useFeed = () => {
  return useQuery({
    queryKey: ["feed"],
    queryFn: () => {
      return accounts.user.feed();
    },
  });
};

export const useUser = (username: string, userId: string = "") => {
  const user = useQuery({
    queryKey: ["users", username],
    queryFn: () => accounts.user.userByUsername(username),
  });

  const posts = useQuery<PaginaatedClubPostsResponse, AppError>({
    queryKey: ["users", username, "posts"],
    queryFn: () => accounts.user.posts(userId),
    enabled: !!userId,
  });

  const postsWithMedia = useQuery<PaginaatedClubPostsResponse, AppError>({
    queryKey: ["users", username, "posts", "media"],
    queryFn: () => {
      return accounts.user.posts(userId, "True");
    },
    enabled: !!userId,
  });

  return { user, posts, postsWithMedia };
};

export const useMe = () => {
  return useQuery({
    queryKey: ["users", "me"],
    queryFn: () => {
      return accounts.user.me();
    },
  });
};

export const useUpdateProfile = (username: string) => {
  console.log(username);
  return useMutation({
    mutationFn: (data: PatchedUserProfileRequest) => {
      return accounts.user.update(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", username] });
      queryClient.invalidateQueries({ queryKey: ["users", "me"] });
    },
  });
};

// export const useAccountActions = (user: Pick<UserProfile, "id" | "username" | "email">) => {

//   return {
//     forgotPassword,
//   };
// }
