import { paths } from "@/settings/routes";
import { type MenuItemType } from "./main-menu";
import { isRouteActive } from "@/utils/route";

export const clubMenu: (
  id: string,
  icon: string,
  slug: string,
) => MenuItemType[] = (id: string, icon: string, slug: string) => {
  const clubPath = paths.public.club.slug(slug);
  return [
    {
      id: id,
      label: slug,
      icon: icon,
      link: () => clubPath,
      isActive: (currentPath) => isRouteActive(clubPath, currentPath, false),
    },
  ];
};
