import { paths, routes } from "@/settings/routes";
// import type { MenuItemType } from "../_core";
import { matchPath } from "react-router-dom";

export type MenuItemType = {
    id: number | string;
    label: string;
    icon?: React.ReactNode | ((icon: string) => React.ReactNode);
    iconActive?: React.ReactNode | ((icon: string) => React.ReactNode);
    link: string | ((id: string) => string);
    isActive: (currentPath: string) => boolean;
};

export function isRouteActive(pattern: string, pathname: string) {
  return !!matchPath(pattern, pathname);
}

export const clubMenu: (id: string, slug: string, icon: React.ReactNode) => MenuItemType[] = (
  id: string,
  icon: React.ReactNode,
  slug: string
) => [
  {
    id: id,
    label: slug,
    icon: icon,
    link: () => paths.public.club.slug(slug),
    isActive: (currentPath) =>
      isRouteActive(routes.club.public.slug, currentPath)
  },
];
