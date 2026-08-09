import { useQuery } from "@tanstack/react-query";
import { club } from "../services/clubs";


export const useApplications = (clubId: string) => {
    return useQuery({
        queryKey: ["applications", clubId],
        queryFn: () => club.application.applications(clubId),
    });
};
