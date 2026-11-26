import { useQuery } from "@tanstack/react-query";
import { club } from "../services/clubs";


export const useMembers = (clubId: string) => {
    return useQuery({
        queryKey: ["members", clubId],
        queryFn: () => club.members.list(clubId),
    });
};


export const useMembership = () => {
    const memberDetails = (clubId: string, memberId: string) => {
        return useQuery({
            queryKey: ["member", clubId, memberId],
            queryFn: () => club.members.member(clubId, memberId),
        });
    };

    const searchMembers = (clubId: string, query: string) => {
        return useQuery({
            queryKey: ["search", clubId, query],
            queryFn: () => club.members.search(clubId, query),
        });
    };

    return { memberDetails, searchMembers };
}