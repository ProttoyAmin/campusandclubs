import { useMutation, useQuery } from "@tanstack/react-query";
import { account } from "../services/user.service";


export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => {
      console.log(account.getUsers());
      return account.getUsers();
    },
  });
};

export const useUser = (username: string) => {
  return useQuery({
    queryKey: ["users", username],
    queryFn: () => {
      return account.getUserByUsername(username)
    }
  })
}


export const useMe = () => {
  return useQuery({
    queryKey: ["users", "me"],
    queryFn: () => {
      return account.getMe()
    }
  })
}