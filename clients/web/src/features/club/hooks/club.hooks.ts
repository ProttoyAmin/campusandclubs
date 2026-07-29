import { useQuery } from "@tanstack/react-query";
import { club } from "../services/clubs";


export const useGetClubs = () => {
  return useQuery({
    queryKey: ["clubs"],
    queryFn: () => {
      console.log("Getting clubs...")
      console.log("openapai client: ", )
      const response = club.getClubs()
      return response
    },
  });
};
