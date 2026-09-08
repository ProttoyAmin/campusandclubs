import { paths, routes } from "@/settings/routes";
import type { MenuItemType } from "../main-menu";
import { isRouteActive } from "@/utils/route";

export const clubProfileMenu: (slug: string) => MenuItemType[] = (
    slug: string,
) => [
        {
            id: 1,
            label: "Posts",
            icon: <></>,
            iconActive: <></>,
            link: () => paths.public.club.slug(slug),
            isActive: (currentPath) =>
                isRouteActive(routes.club.public.base, currentPath),
        },
        {
            id: 2,
            label: "Media",
            icon: <></>,
            iconActive: <></>,
            link: () => paths.private.club.media(slug),
            isActive: (currentPath) =>
                isRouteActive(routes.club.private.media, currentPath),
        }
    ];
