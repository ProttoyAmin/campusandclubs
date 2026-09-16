import { paths, routes } from "@/settings/routes";
import type { MenuItemType } from "../main-menu";
import { isRouteActive } from "@/utils/route";

export const profileMenu: (username: string) => MenuItemType[] = (
  username: string,
) => [
    {
      id: 1,
      label: "Posts",
      icon: <></>,
      iconActive: <></>,
      link: () => paths.private.user.profile(username),
      isActive: (currentPath) =>
        isRouteActive(routes.user.private.profile.username, currentPath),
    },
    {
      id: 2,
      label: "Media",
      icon: <></>,
      iconActive: <></>,
      link: () => paths.private.user.media(username),
      isActive: (currentPath) =>
        isRouteActive(routes.user.private.profile.media, currentPath),
    },
    {
      id: 3,
      label: "Reposts",
      icon: <></>,
      iconActive: <></>,
      link: () => paths.private.user.reposts(username),
      isActive: (currentPath) =>
        isRouteActive(routes.user.private.profile.reposts, currentPath),
    },
  ];
