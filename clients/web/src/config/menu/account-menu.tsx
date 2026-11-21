import { HugeiconsIcon } from "@hugeicons/react";
import type { MenuItemType } from "./main-menu";
import { Key01Icon, Mail01Icon } from "@hugeicons/core-free-icons";
import { isRouteActive } from "@/utils/route";
import { routes } from "@/settings/routes";

export const AccountsMenu: () => MenuItemType[] = () => [
    {
        id: 1,
        label: "Emails",
        description: "Manage emails in one place",
        icon: <HugeiconsIcon icon={Mail01Icon} />,
        iconActive: <HugeiconsIcon icon={Mail01Icon} />,
        link: () => routes.settings.account.email,
        isActive: (currentPath: string) =>
            isRouteActive(routes.settings.account.email, currentPath),
    },
    {
        id: 2,
        label: "Password & Security",
        icon: <HugeiconsIcon icon={Key01Icon} />,
        iconActive: <HugeiconsIcon icon={Key01Icon} />,
        link: () => routes.settings.account.password,
        isActive: (currentPath: string) =>
            isRouteActive(routes.settings.account.password, currentPath),
    },
    {
        id: 3,
        label: "Sessions & Devices",
        icon: <HugeiconsIcon icon={Key01Icon} />,
        iconActive: <HugeiconsIcon icon={Key01Icon} />,
        link: () => routes.settings.account.sessions,
        isActive: (currentPath: string) =>
            isRouteActive(routes.settings.account.sessions, currentPath),
    },
];