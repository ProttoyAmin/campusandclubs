import { HugeiconsIcon } from "@hugeicons/react";
import type { MenuItemType } from "./main-menu";
import { Key01Icon, Mail01Icon } from "@hugeicons/core-free-icons";
import { isRouteActive } from "@/utils/route";
import { routes } from "@/settings/routes";

export const AccountsMenu: () => MenuItemType[] = () => [
    {
        id: 1,
        label: "Emails",
        icon: <HugeiconsIcon icon={Mail01Icon} />,
        iconActive: <HugeiconsIcon icon={Mail01Icon} />,
        link: () => routes.settings.account.email,
        isActive: (currentPath: string) =>
            isRouteActive(routes.settings.account.email, currentPath),
    },
    {
        id: 2,
        label: "Passwords",
        icon: <HugeiconsIcon icon={Key01Icon} />,
        iconActive: <HugeiconsIcon icon={Key01Icon} />,
        link: () => routes.settings.account.password,
        isActive: (currentPath: string) =>
            isRouteActive(routes.settings.account.password, currentPath),
    },
];