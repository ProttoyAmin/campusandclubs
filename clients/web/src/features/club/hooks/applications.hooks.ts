import { useMutation, useQuery } from "@tanstack/react-query";
import { club } from "../services/clubs";
import { queryClient } from "@/config/query-client";


export const useApplications = (clubId: string) => {
    return useQuery({
        queryKey: ["applications", clubId],
        queryFn: () => club.application.applications(clubId),
    });
};

export const useApplication = (clubId: string, applicationID: string) => {
    const application = useQuery({
        queryKey: ["application", clubId, applicationID],
        queryFn: () => club.application.application(clubId, applicationID),
    });

    const approve = useMutation({
        mutationFn: () => club.application.approve(clubId, applicationID),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["applications", clubId] });
        },
    });
    const reject = useMutation({
        mutationFn: () => club.application.reject(clubId, applicationID),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["applications", clubId] });
        },
    });

    return { application, approve, reject };
};
