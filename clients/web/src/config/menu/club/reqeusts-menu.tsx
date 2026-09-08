import { paths, routes } from "@/settings/routes";
import { House } from "lucide-react";
import { isRouteActive } from "@/utils/route";
import type { MenuItemType } from "../main-menu";
import { HugeiconsIcon } from "@hugeicons/react";
import { BubbleChatDelayIcon, CheckCheckIcon, FileXCornerIcon } from "@hugeicons/core-free-icons";


export const ClubRequestsMenu: (slug: string) => MenuItemType[] = (slug: string) => [
    // {
    //     id: 1,
    //     label: "All",
    //     icon: <House size={18} />,
    //     iconActive: <House size={18} fill="currentColor" stroke="currentColor" />,
    //     link: () => paths.private.club.requests.base(slug),
    //     isActive: (currentPath) =>
    //         isRouteActive(routes.club.private.config.requests.base, currentPath),
    // },
    {
        id: 1,
        label: "Pending",
        icon: <HugeiconsIcon icon={BubbleChatDelayIcon} />,
        iconActive: <HugeiconsIcon icon={BubbleChatDelayIcon} />,
        link: () => paths.private.club.requests.pendings(slug),
        isActive: (currentPath) =>
            isRouteActive(routes.club.private.config.requests.pendings, currentPath),
    },
    {
        id: 2,
        label: "Approved",
        icon: <HugeiconsIcon icon={CheckCheckIcon} />,
        iconActive: <HugeiconsIcon icon={CheckCheckIcon} />,
        link: () => paths.private.club.requests.approved(slug),
        isActive: (currentPath) =>
            isRouteActive(routes.club.private.config.requests.approved, currentPath),
    },
    {
        id: 3,
        label: "Rejected",
        icon: <HugeiconsIcon icon={FileXCornerIcon} />,
        iconActive: <HugeiconsIcon icon={FileXCornerIcon} />,
        link: () => paths.private.club.requests.rejected(slug),
        isActive: (currentPath) =>
            isRouteActive(routes.club.private.config.requests.rejected, currentPath),
    },
];
