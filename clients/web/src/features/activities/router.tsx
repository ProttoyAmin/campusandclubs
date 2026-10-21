import ActivityLayout from "@/layouts/activity/activity-layout";
import { routes } from "@/settings/routes";

const activityRoutes = [
    {
        id: "activity",
        path: routes.activity.base,
        element: <ActivityLayout />,
    }
];

export default activityRoutes;