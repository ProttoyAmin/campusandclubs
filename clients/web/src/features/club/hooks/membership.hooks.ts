import { useQuery } from "@tanstack/react-query";
import { club } from "../services/clubs";


export const useMembers = (clubId: string) => {
    return useQuery({
        queryKey: ["members", clubId],
        queryFn: () => club.members.list(clubId),
    });
};
