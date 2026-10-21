import { notifications } from "../services/notification.service";
import { useQuery } from "@tanstack/react-query";


export const useNotifications = () => {
    const getNotifications = useQuery({
        queryKey: ["notifications"],
        queryFn: () => notifications.list()
    })
    return {
        getNotifications,
    }
}