import { useMutation, useQuery } from "@tanstack/react-query";
import { account } from "../services/user.service";


export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => {
      return account.getUsers();
    },
  });
};
