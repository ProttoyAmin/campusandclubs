import { paths, routes } from "@/settings/routes";
import { House, LayoutList } from "lucide-react";
import { isRouteActive } from "@/utils/route";

export type MenuItemType = {
  id: number | string;
  label: string;
  icon?: React.ReactNode | ((icon: string) => React.ReactNode) | string;
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
    icon: <House size={18} />,
    iconActive: <House size={18} fill="currentColor" stroke="currentColor" />,
    link: () => paths.public.home,
    isActive: (currentPath) => isRouteActive(routes.home, currentPath),
  },
  {
    id: 2,
    label: "Profile",
    icon: <LayoutList size={18} />,
    iconActive: (
      <LayoutList size={18} fill="currentColor" stroke="currentColor" />
    ),
    link: () => paths.private.user.profile(username),
    isActive: (currentPath) =>
      isRouteActive(routes.user.public.profile, currentPath) &&
      currentPath.includes(username),
  },
  {
    id: 3,
    label: "Clubs",
    icon: <LayoutList size={18} />,
    iconActive: (
      <LayoutList size={18} fill="currentColor" stroke="currentColor" />
    ),
    link: () => paths.private.club.list,
    isActive: (currentPath) =>
      isRouteActive(routes.club.private.list, currentPath),
  },
];
