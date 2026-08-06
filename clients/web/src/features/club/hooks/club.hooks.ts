import { useQuery } from "@tanstack/react-query";
import { club } from "../services/clubs";


export const useGetClubs = () => {
  return useQuery({
    queryKey: ["clubs"],
    queryFn: () => {
      const response = club.clubs()
      return response
    },
  });
};
