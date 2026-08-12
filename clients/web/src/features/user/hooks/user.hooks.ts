import { useMutation, useQuery } from "@tanstack/react-query";
import { account } from "../services/user.service";
import type { PatchedUserProfileRequest, UserProfile } from "@campus/api";
import { queryClient } from "@/config/query-client";

export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => {
      return account.users();
    },
  });
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