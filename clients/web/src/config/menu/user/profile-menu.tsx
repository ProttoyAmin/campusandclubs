import { paths, routes } from "@/settings/routes";
import { House, LayoutList } from "lucide-react";
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
      link: () => paths.private.user.posts(username),
      isActive: (currentPath) =>
        isRouteActive(routes.user.private.profile.posts, currentPath),
    },
    {
      id: 2,
      label: "Reels",
      icon: <LayoutList size={18} />,
      iconActive: (
        <LayoutList size={18} fill="currentColor" stroke="currentColor" />
      ),
      link: () => paths.private.user.reels(username),
      isActive: (currentPath) =>
        isRouteActive(routes.user.private.profile.reels, currentPath),
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
