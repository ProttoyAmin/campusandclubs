import { useMutation, useQuery } from "@tanstack/react-query";
import { account } from "../services/user.service";
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
      return account.users();
    },
  });
};

export const useAccount = () => {
  const addEmail = useMutation<UserEmail, AppError<AllauthError>, string>({
    mutationFn: (email: string) => {
      return account.add_email(email);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails"] });
    },
  });

  const deleteEmail = useMutation<UserEmail[], AppError<AllauthError>, string>({
    mutationFn: (email: string) => {
      return account.delete_email(email);
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
      return account.request_email_verification(email);
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
      return account.change_primary_email(email);
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
      return account.password_change(data);
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
      return account.emails();
    },
  });
};

export const useAffiliations = () => {
  return useQuery({
    queryKey: ["affiliations"],
    queryFn: () => {
      return account.affiliations();
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
      return account.feed();
    },
  });
};

export const useUser = (username: string) => {
  return useQuery({
    queryKey: ["users", username],
    queryFn: () => {
      return account.userByUsername(username);
    },
  });
};

export const useMe = () => {
  return useQuery({
    queryKey: ["users", "me"],
    queryFn: () => {
      return account.me();
    },
  });
};

export const useUpdateProfile = (username: string) => {
  return useMutation({
    mutationFn: (data: PatchedUserProfileRequest) => {
      return account.update(data);
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
