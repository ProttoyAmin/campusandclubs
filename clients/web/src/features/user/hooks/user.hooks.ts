import { useMutation, useQuery } from "@tanstack/react-query";
import { user } from "../services/user.service";
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
    AccountsAuthUsersSetPasswordCreateResponse,
    AppError<AllauthError>,
    SetPasswordRequest
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

export const useProfile = () => {
  const emails = useEmails();
  const affiliations = useAffiliations();
  const me = useMe();

  return {
    emails,
    affiliations,
    me,
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
    queryFn: () => {
      return accounts.user.userByUsername(username);
    },
  });

  const posts = useQuery({
    queryKey: ["users", username, "posts"],
    queryFn: () => {
      if (userId) {
        return accounts.user.posts(userId);
      }
      return accounts.user.posts(username);
    },
  });

  return { user, posts };
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
  return useMutation({
    mutationFn: (data: PatchedUserProfileRequest) => {
      return accounts.user.update(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", username] });
      console.log("Profile updated successfully");
    },
    onError: (error) => {
      console.error("Update profile error:", error);
    },
  });
};

// export const useAccountActions = (user: Pick<UserProfile, "id" | "username" | "email">) => {

//   return {
//     forgotPassword,
//   };
// }
