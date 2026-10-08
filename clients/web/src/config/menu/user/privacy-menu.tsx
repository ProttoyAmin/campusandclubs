import { HugeiconsIcon } from "@hugeicons/react";
import type { MenuItemType } from "@/config/menu/main-menu";
import { Key01Icon, Mail01Icon } from "@hugeicons/core-free-icons";
import { isRouteActive } from "@/utils/route";
import { routes } from "@/settings/routes";

export const AccountPrivacyMenu: () => MenuItemType[] = () => [
    {
        id: 1,
        label: "Private Profile",
        icon: <HugeiconsIcon icon={Mail01Icon} />,
        iconActive: <HugeiconsIcon icon={Mail01Icon} />,
        link: () => routes.settings.privacy.account,
        isActive: (currentPath: string) =>
            isRouteActive(routes.settings.privacy.account, currentPath),
    },
    {
        id: 2,
        label: "Online Status",
        icon: <HugeiconsIcon icon={Key01Icon} />,
        iconActive: <HugeiconsIcon icon={Key01Icon} />,
        link: () => routes.settings.privacy.onlineStatus,
        isActive: (currentPath: string) =>
            isRouteActive(routes.settings.privacy.onlineStatus, currentPath),
    },
    {
        id: 3,
        label: "Messages",
        icon: <HugeiconsIcon icon={Key01Icon} />,
        iconActive: <HugeiconsIcon icon={Key01Icon} />,
        link: () => routes.settings.privacy.messages,
        isActive: (currentPath: string) =>
            isRouteActive(routes.settings.privacy.messages, currentPath),
    },
    {
        id: 4,
        label: "Blocked profiles",
        icon: <HugeiconsIcon icon={Key01Icon} />,
        iconActive: <HugeiconsIcon icon={Key01Icon} />,
        link: () => routes.settings.privacy.blockedUsers,
        isActive: (currentPath: string) =>
            isRouteActive(routes.settings.privacy.blockedUsers, currentPath),
    },
];