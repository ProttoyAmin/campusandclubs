import { useMutation, useQuery } from "@tanstack/react-query";
import { club } from "../services/clubs";
import { queryClient } from "@/config/query-client";


export const useApplications = (clubId: string) => {
    return useQuery({
        queryKey: ["applications", clubId],
        queryFn: () => club.application.applications(clubId),
    });
};

export const useApplicationBulkActions = (clubId: string) => {
    const bulkApplicationsApprove = useMutation({
        mutationFn: (application_ids: string[]) => club.application.bulkApplicationsApprove(clubId, application_ids),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["applications", clubId] });
        },
    });

    const bulkApplicationsReject = useMutation({
        mutationFn: (application_ids: string[]) => club.application.bulkApplicationsReject(clubId, application_ids),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["applications", clubId] });
        },
    });

    return { bulkApplicationsApprove, bulkApplicationsReject };
}

export const useApplication = (clubId: string, applicationID: string) => {
    const application = useQuery({
        queryKey: ["application", clubId, applicationID],
        queryFn: () => club.application.application(clubId, applicationID),
    });

    const approve = (applicationID: string) => useMutation({
        mutationFn: () => club.application.approve(clubId, applicationID),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["applications", clubId] });
        },
    });

    const reject = (applicationID: string) => useMutation({
        mutationFn: () => club.application.reject(clubId, applicationID),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["applications", clubId] });
        },
    });

    return { application, approve, reject };
};
