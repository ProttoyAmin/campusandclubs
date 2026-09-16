import { paths, routes } from "@/settings/routes";
import { isRouteActive } from "@/utils/route";
import { HugeiconsIcon } from "@hugeicons/react";
import { Home01Icon, Message01Icon, OpenSourceIcon, UserRoundIcon } from "@hugeicons/core-free-icons";

export type MenuItemType = {
  id: number | string;
  label: string;
  icon?: React.ReactNode;
  iconActive?: React.ReactNode | ((icon: string) => React.ReactNode);
  link: string | ((id: string) => string);
  isActive: (currentPath: string) => boolean;
};

export const userMenu: (username: string) => MenuItemType[] = (
  username: string,
) => [
    {
      id: 1,
      label: "Home",
      icon: <HugeiconsIcon icon={Home01Icon} size={24} />,
      iconActive: <HugeiconsIcon icon={Home01Icon} size={24} color="currentColor" strokeWidth={2} stroke="currentColor" fill="currentColor" />,
      link: () => paths.public.home,
      isActive: (currentPath) => isRouteActive(routes.home, currentPath),
    },
    {
      id: 2,
      label: "Profile",
      icon: <HugeiconsIcon icon={UserRoundIcon} size={24} />,
      iconActive: (
        <HugeiconsIcon icon={UserRoundIcon} size={24} color="currentColor" stroke="currentColor" fill="currentColor" />
      ),
      link: () => paths.private.user.profile(username),
      isActive: (currentPath) =>
        isRouteActive(routes.user.public.profile, currentPath) &&
        currentPath === `/@/${username}`,
    },
    {
      id: 3,
      label: "Messages",
      icon: <HugeiconsIcon icon={Message01Icon} size={24} />,
      iconActive: (
        <HugeiconsIcon icon={Message01Icon} size={24} color="currentColor" strokeWidth={2} stroke="currentColor" fill="currentColor" />
      ),
      link: () => paths.private.chat.inbox,
      isActive: (currentPath) =>
        isRouteActive(routes.chat.inbox, currentPath)
    },
    {
      id: 4,
      label: "Clubs",
      icon: <HugeiconsIcon icon={OpenSourceIcon} size={24} />,
      iconActive: (
        <HugeiconsIcon icon={OpenSourceIcon} size={24} color="currentColor" stroke="currentColor" fill="currentColor" />
      ),
      link: () => paths.private.club.list,
      isActive: (currentPath) =>
        isRouteActive(routes.club.private.list, currentPath),
    },
  ];
