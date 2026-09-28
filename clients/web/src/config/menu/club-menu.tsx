import { paths } from "@/settings/routes";
import { type MenuItemType } from "./main-menu";
import { isRouteActive } from "@/utils/route";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserGroup02FreeIcons } from "@hugeicons/core-free-icons";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "design/components/ui/avatar"

export const clubMenu: (
  id: string,
  icon: string,
  slug: string,
  name: string
) => MenuItemType[] = (id: string, icon: string, slug: string, name: string) => {
  const clubPath = paths.public.club.slug(slug);
  return [
    {
      id: id,
      label: name,
      icon: (
        <Avatar size="sm" className="shrink-0 rounded-md">
          <AvatarImage src={icon} alt={name} />
          <AvatarFallback className="rounded-md text-[8px]">
            {name.charAt(0)}
          </AvatarFallback>
        </Avatar>
      ),
      link: () => clubPath,
      isActive: (currentPath) => isRouteActive(clubPath, currentPath, false),
    },
  ];
};
