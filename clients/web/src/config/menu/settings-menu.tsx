import { paths, routes } from "@/settings/routes";
import { House, LayoutList } from "lucide-react";
import { matchPath } from "react-router-dom";
import type { MenuItemType } from "../menu/main-menu";


export function isRouteActive(pattern: string, pathname: string) {
  return !!matchPath(pattern, pathname);
}

export const SettingsMenu: () => MenuItemType[] = (
) => [
  {
    id: 1,
    label: "Account",
    icon: <House size={18} />,
    iconActive: <House size={18} fill="currentColor" stroke="currentColor" />,
    link: () => paths.private.settings.account,
    isActive: (currentPath) =>
      isRouteActive(routes.settings.account, currentPath),
  },
  {
    id: 2,
    label: "Privacy",
    icon: <LayoutList size={18} />,
    iconActive: <LayoutList size={18} fill="currentColor" stroke="currentColor" />,
    link: () => paths.private.settings.privacy,
    isActive: (currentPath) =>
      isRouteActive(routes.settings.privacy, currentPath),
  },
  {
    id: 3,
    label: "Affiliations",
    icon: <LayoutList size={18} />,
    iconActive: <LayoutList size={18} fill="currentColor" stroke="currentColor" />,
    link: () => paths.private.settings.affilications,
    isActive: (currentPath) =>
      isRouteActive(routes.settings.affiliations, currentPath),
  }
];


export const SettingsDropdownMenu: () => MenuItemType[] = (
) => [
  {
    id: 1,
    label: "Settings",
    icon: <House size={18} />,
    iconActive: <House size={18} fill="currentColor" stroke="currentColor" />,
    link: () => routes.settings.account,
    isActive: (currentPath) =>
      isRouteActive(routes.settings.account, currentPath),
  }
];