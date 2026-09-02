import { paths, routes } from "@/settings/routes";
import { House, LayoutList, ImageIcon } from "lucide-react";
import type { MenuItemType } from "../main-menu";
import { isRouteActive } from "@/utils/route";

export const profileMenu: (username: string) => MenuItemType[] = (
  username: string,
) => [
    {
      id: 1,
      label: "Posts",
      icon: <House size={18} />,
      iconActive: <House size={18} fill="currentColor" stroke="currentColor" />,
      link: () => paths.private.user.profile(username),
      isActive: (currentPath) =>
        isRouteActive(routes.user.private.profile.username, currentPath),
    },
    {
      id: 2,
      label: "Media",
      icon: <ImageIcon size={18} />,
      iconActive: (
        <ImageIcon size={18} fill="currentColor" stroke="currentColor" />
      ),
      link: () => paths.private.user.media(username),
      isActive: (currentPath) =>
        isRouteActive(routes.user.private.profile.media, currentPath),
    },
    {
      id: 3,
      label: "Reposts",
      icon: <LayoutList size={18} />,
      iconActive: (
        <LayoutList size={18} fill="currentColor" stroke="currentColor" />
      ),
      link: () => paths.private.user.reposts(username),
      isActive: (currentPath) =>
        isRouteActive(routes.user.private.profile.reposts, currentPath),
    },
  ];
