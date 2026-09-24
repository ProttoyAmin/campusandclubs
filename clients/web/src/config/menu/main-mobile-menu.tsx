import { paths, routes } from "@/settings/routes";
import { isRouteActive } from "@/utils/route";
import { HugeiconsIcon } from "@hugeicons/react";
import { Home01Icon, MessageCircleIcon, UserRoundIcon } from "@hugeicons/core-free-icons";

export type MenuItemType = {
    id: number | string;
    label: string;
    icon?: React.ReactNode;
    iconActive?: React.ReactNode | ((icon: string) => React.ReactNode);
    link: string | ((id: string) => string);
    isActive: (currentPath: string) => boolean;
};

export const MainMobileMenu: (username: string) => MenuItemType[] = (
    username: string,
) => [
        {
            id: 1,
            label: "Home",
            icon: <HugeiconsIcon icon={Home01Icon} size={20} />,
            iconActive: <HugeiconsIcon icon={Home01Icon} size={20} color="currentColor" stroke="currentColor" fill="currentColor" />,
            link: () => paths.public.home,
            isActive: (currentPath) => isRouteActive(routes.home, currentPath),
        },
        {
            id: 2,
            label: "Profile",
            icon: <HugeiconsIcon icon={UserRoundIcon} size={20} />,
            iconActive: (
                <HugeiconsIcon icon={UserRoundIcon} size={20} color="currentColor" stroke="currentColor" fill="currentColor" />
            ),
            link: () => paths.private.user.profile(username),
            isActive: (currentPath) =>
                isRouteActive(routes.user.public.profile, currentPath) &&
                currentPath === `/@/${username}`,
        },
        {
            id: 3,
            label: "Chats",
            icon: <HugeiconsIcon icon={MessageCircleIcon} size={20} />,
            iconActive: (
                <HugeiconsIcon icon={MessageCircleIcon} size={20} color="currentColor" stroke="currentColor" fill="currentColor" />
            ),
            link: () => paths.private.chat.chats,
            isActive: (currentPath) =>
                isRouteActive(routes.chat.chats, currentPath)
        },
    ];
