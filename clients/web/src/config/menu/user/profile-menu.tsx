import { paths, routes } from "@/settings/routes";
import { House, LayoutList } from "lucide-react";
import type { MenuItemType } from "../main-menu";
import { isRouteActive } from "@/utils/route";

export const userSettingsMenu: (username: string) => MenuItemType[] = (
  username: string,
) => [
  {
    id: 1,
    label: "Posts",
    icon: <House size={18} />,
    iconActive: <House size={18} fill="currentColor" stroke="currentColor" />,
    link: () => paths.private.user.settings.account(username),
    isActive: (currentPath) =>
      isRouteActive(routes.user.private.settings.account, currentPath),
  },
  {
    id: 2,
    label: "Reels",
    icon: <LayoutList size={18} />,
    iconActive: (
      <LayoutList size={18} fill="currentColor" stroke="currentColor" />
    ),
    link: () => paths.private.user.settings.privacy(username),
    isActive: (currentPath) =>
      isRouteActive(routes.user.private.settings.privacy, currentPath),
  },
  {
    id: 3,
    label: "Reposts",
    icon: <LayoutList size={18} />,
    iconActive: (
      <LayoutList size={18} fill="currentColor" stroke="currentColor" />
    ),
    link: () => paths.private.user.settings.affilications(username),
    isActive: (currentPath) =>
      isRouteActive(routes.user.private.settings.affilications, currentPath),
  },
];
