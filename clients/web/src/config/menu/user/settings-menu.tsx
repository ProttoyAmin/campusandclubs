import { paths, routes } from "@/settings/routes";
import { LockIcon, GitPullRequestCreateIcon, User2Icon } from "lucide-react";
import type { MenuItemType } from "../main-menu";
import { isRouteActive } from "@/utils/route";

export const userSettingsMenu: (username: string) => MenuItemType[] = (
  username: string,
) => [
    {
      id: 1,
      label: "Account",
      icon: <User2Icon size={18} />,
      iconActive: <User2Icon size={18} fill="currentColor" stroke="currentColor" />,
      link: () => paths.private.user.settings.account(username),
      isActive: (currentPath) =>
        isRouteActive(routes.user.private.settings.account, currentPath),
    },
    {
      id: 2,
      label: "Privacy",
      icon: <LockIcon size={18} />,
      iconActive: (
        <LockIcon size={18} fill="currentColor" stroke="currentColor" />
      ),
      link: () => paths.private.user.settings.privacy(username),
      isActive: (currentPath) =>
        isRouteActive(routes.user.private.settings.privacy, currentPath),
    },
    {
      id: 3,
      label: "Affiliations",
      icon: <GitPullRequestCreateIcon size={18} />,
      iconActive: (
        <GitPullRequestCreateIcon size={18} fill="currentColor" stroke="currentColor" />
      ),
      link: () => paths.private.user.settings.affilications(username),
      isActive: (currentPath) =>
        isRouteActive(routes.user.private.settings.affilications, currentPath),
    },
  ];
