import { paths, routes } from "@/settings/routes";
import { House, LayoutList } from "lucide-react";
// import type { MenuItemType } from "../_core";
import { matchPath } from "react-router-dom";

export type MenuItemType = {
    id: number;
    label: string;
    icon?: React.ReactNode | ((icon: string) => React.ReactNode);
    iconActive?: React.ReactNode | ((icon: string) => React.ReactNode);
    link: string | ((id: string) => string);
    isActive: (currentPath: string) => boolean;
};

export function isRouteActive(pattern: string, pathname: string) {
  return !!matchPath(pattern, pathname);
}

export const userMenu: (userId: string) => MenuItemType[] = (
  userId: string,
) => [
  {
    id: 1,
    label: "Home",
    icon: <House size={18} />,
    iconActive: <House size={18} fill="currentColor" stroke="currentColor" />,
    link: () => paths.public.home,
    isActive: (currentPath) =>
      isRouteActive(routes.home, currentPath),
  },
  {
    id: 2,
    label: "Profile",
    icon: <LayoutList size={18} />,
    iconActive: (
      <LayoutList size={18} fill="currentColor" stroke="currentColor" />
    ),
    link: () => paths.private.user.profile(userId),
    isActive: (currentPath) =>
      isRouteActive(routes.user.public.profile, currentPath)
  },
];
