import Inbox from "./pages/inbox";
import { chatRoutes as chatRoutesSettings } from "@/settings/routes";

export const chatRoutes = [
    {
        id: "chat-inbox",
        path: chatRoutesSettings.inbox,
        element: <Inbox />,
    },
];
