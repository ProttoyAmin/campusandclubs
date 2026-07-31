import { useMutation, useQuery } from "@tanstack/react-query";
import { account } from "../services/user.service";


export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => {
      return account.users();
    },
  });
};

export const useUser = (username: string) => {
  return useQuery({
    queryKey: ["users", username],
    queryFn: () => {
      return account.userByUsername(username)
    }
  })
}


export const useMe = () => {
  return useQuery({
    queryKey: ["users", "me"],
    queryFn: () => {
      return account.me()
    }
  })
}