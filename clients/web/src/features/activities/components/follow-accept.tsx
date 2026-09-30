import { useConnections } from "@/features/activities/hooks/activity.hook"
import AppAlertDialog from "@/shared/components/alert"
import { Button } from "design/components/ui/button"

const FollowAccept = () => {
    const { listRequests, acceptRequest, rejectRequest } = useConnections();
    const { data: requests, isLoading, error } = listRequests();

    if (isLoading) {
        return <div>Loading...</div>
    }
    return (
        <div>FollowAccept</div>
    )
}

export default FollowAccept